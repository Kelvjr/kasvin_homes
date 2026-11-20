import { describe, expect, it } from 'vitest';
import ICAL from 'ical.js';
import {
  accraToday,
  interval,
  overlap,
  parseDate,
} from '../modules/availability/dates.js';
import { priceStay } from '../modules/availability/pricing.js';
import {
  parseCalendar,
  validateCalendarUrl,
} from '../modules/availability/calendar.sync.js';

const now = new Date('2026-11-19T23:00:00Z');
const calendar = (events: string) =>
  `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events}END:VCALENDAR\r\n`;
const event = (uid: string, start: string, end: string) =>
  `BEGIN:VEVENT\r\nUID:${uid}\r\nDTSTART;VALUE=DATE:${start}\r\nDTEND;VALUE=DATE:${end}\r\nEND:VEVENT\r\n`;

describe('date and pricing rules', () => {
  it('uses Ghana civil dates and rejects invalid intervals', () => {
    expect(accraToday(now).toISOString()).toBe('2026-11-19T00:00:00.000Z');
    expect(interval('2028-02-28', '2028-03-01', now).nights).toBe(2);
    expect(() => parseDate('2027-02-29')).toThrow();
    expect(() => interval('2026-11-19', '2026-11-19', now)).toThrow();
    expect(() => interval('2026-11-18', '2026-11-20', now)).toThrow();
    expect(() => interval('2026-11-19', '2028-01-01', now)).toThrow();
    expect(
      overlap(
        parseDate('2026-12-01'),
        parseDate('2026-12-02'),
        parseDate('2026-12-02'),
        parseDate('2026-12-03'),
      ),
    ).toBe(false);
  });
  it('applies override, weekday, base, then one eligible discount with half-up rounding', () => {
    const quote = priceStay({
      start: parseDate('2026-12-04'),
      nights: 3,
      baseRate: 101,
      overrides: [{ date: parseDate('2026-12-04'), nightlyRateMinor: 201 }],
      weekdays: [{ weekday: 6, nightlyRateMinor: 301 }],
      discounts: [
        { minNights: 2, discountBps: 500 },
        { minNights: 7, discountBps: 1500 },
      ],
    });
    expect(
      quote.nightly.map((night) => [night.nightlyRateMinor, night.source]),
    ).toEqual([
      [201, 'override'],
      [301, 'weekday'],
      [101, 'base'],
    ]);
    expect(quote.accommodationSubtotalMinor).toBe(603);
    expect(quote.discountTotalMinor).toBe(30);
    expect(quote.accommodationTotalMinor).toBe(573);
    expect(() =>
      priceStay({
        start: parseDate('2026-12-01'),
        nights: 1,
        baseRate: null,
        overrides: [],
        weekdays: [],
        discounts: [],
      }),
    ).toThrow();
  });
});

describe('iCalendar import and export contract', () => {
  it('parses all-day events, deduplicates UIDs and honors exclusive DTEND', () => {
    const parsed = parseCalendar(
      calendar(
        event('abc', '20261210', '20261213') +
          event('abc', '20261210', '20261213'),
      ),
    );
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.startDate.toISOString().slice(0, 10)).toBe('2026-12-10');
    expect(parsed[0]?.endDate.toISOString().slice(0, 10)).toBe('2026-12-13');
  });
  it('rejects conflicting UIDs, recurrence, floating time and malformed files', () => {
    expect(() =>
      parseCalendar(
        calendar(
          event('abc', '20261210', '20261213') +
            event('abc', '20261211', '20261214'),
        ),
      ),
    ).toThrow();
    expect(() =>
      parseCalendar(
        calendar(
          event('abc', '20261210', '20261213').replace(
            'END:VEVENT',
            'RRULE:FREQ=DAILY\r\nEND:VEVENT',
          ),
        ),
      ),
    ).toThrow();
    expect(() => parseCalendar('not a calendar')).toThrow();
    expect(() =>
      parseCalendar(
        calendar(
          'BEGIN:VEVENT\r\nUID:floating\r\nDTSTART:20261210T120000\r\nDTEND:20261210T130000\r\nEND:VEVENT\r\n',
        ),
      ),
    ).toThrow();
  });
  it('normalizes UTC date-time intervals and ignores cancelled events', () => {
    const body = calendar(
      'BEGIN:VEVENT\r\nUID:timed\r\nDTSTART:20261210T120000Z\r\nDTEND:20261211T010000Z\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:cancelled\r\nSTATUS:CANCELLED\r\nDTSTART;VALUE=DATE:20261210\r\nDTEND;VALUE=DATE:20261212\r\nEND:VEVENT\r\n',
    );
    expect(
      parseCalendar(body).map((entry) => [
        entry.uid,
        entry.startDate.toISOString().slice(0, 10),
        entry.endDate.toISOString().slice(0, 10),
      ]),
    ).toEqual([['timed', '2026-12-10', '2026-12-12']]);
  });
  it('removes a prior UID when the same feed marks it cancelled', () => {
    const active = event('changed', '20261210', '20261212');
    const cancelled = active.replace(
      'END:VEVENT',
      'STATUS:CANCELLED\r\nEND:VEVENT',
    );
    expect(parseCalendar(calendar(active + cancelled))).toEqual([]);
  });
  it('rejects unsafe calendar URLs and accepts public HTTPS hosts', () => {
    expect(() =>
      validateCalendarUrl('http://calendar.airbnb.com/test.ics'),
    ).toThrow();
    expect(() => validateCalendarUrl('https://localhost/test.ics')).toThrow();
    expect(() =>
      validateCalendarUrl('https://169.254.169.254/latest'),
    ).toThrow();
    expect(
      validateCalendarUrl('https://www.airbnb.com/calendar.ics').hostname,
    ).toBe('www.airbnb.com');
  });
  it('validates a generated-style export with a real iCalendar parser', () => {
    const component = new ICAL.Component(
      ICAL.parse(
        calendar(event('stable@kasvin-homes', '20261210', '20261213')),
      ),
    );
    expect(component.getAllSubcomponents('vevent')).toHaveLength(1);
  });
});
