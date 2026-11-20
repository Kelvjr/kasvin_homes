import request from 'supertest';
import ICAL from 'ical.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closeDatabaseConnection, getDatabaseClient } from '@kasvin/database';
import { createApp } from '../app.js';
import { parseConfig } from '../config/env.js';
import { ApartmentService } from '../modules/apartments/apartment.service.js';
import { AvailabilityService } from '../modules/availability/availability.service.js';
import { CalendarSyncService } from '../modules/availability/calendar.sync.js';

const url = process.env.M2_TEST_DATABASE_URL;
const token = 'm2_integration_test_token_0123456789abcdef';
describe.skipIf(!url)('M2 PostgreSQL integration', () => {
  if (
    url &&
    (new URL(url).hostname !== '127.0.0.1' ||
      !new URL(url).pathname.endsWith('_test'))
  )
    throw new Error(
      'M2_TEST_DATABASE_URL must be a local disposable *_test database',
    );
  const db = getDatabaseClient(url ?? 'postgresql://127.0.0.1/kasvin_m2_test');
  const clock = () => new Date('2026-11-19T12:00:00Z');
  const sync = new CalendarSyncService(
    db,
    async () =>
      'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:airbnb-1\r\nDTSTART;VALUE=DATE:20261220\r\nDTEND;VALUE=DATE:20261222\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n',
    clock,
  );
  const config = parseConfig({
    NODE_ENV: 'test',
    DATABASE_URL: url ?? 'postgresql://127.0.0.1/kasvin_m2_test',
    CORS_ORIGINS: 'http://localhost:3000',
    DEV_ADMIN_TOKEN: token,
  });
  const app = createApp(
    config,
    async () => {},
    new ApartmentService(db),
    new AvailabilityService(db, clock),
    sync,
  );
  let apartmentId: string;
  const admin = (
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    path: string,
  ) =>
    request(app)
      [method](`/api/v1/admin${path}`)
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const existing = await db.apartment.findUnique({
      where: { code: 'M2_TEST' },
    });
    if (existing) await db.apartment.delete({ where: { id: existing.id } });
    const apartment = await db.apartment.create({
      data: {
        code: 'M2_TEST',
        name: 'M2 Test Apartment',
        slug: 'm2-test-apartment',
        bedrooms: 1,
        maximumGuests: 2,
        baseNightlyRateMinor: 10000,
        status: 'PUBLISHED',
        publishedAt: clock(),
      },
    });
    apartmentId = apartment.id;
  });
  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('defaults to fail-closed until synchronization requirement is configured', async () => {
    const response = await request(app).post('/api/v1/quotes').send({
      apartmentId,
      checkIn: '2026-12-10',
      checkOut: '2026-12-11',
      guests: 2,
    });
    expect(response.status).toBe(503);
    expect(response.body.error).toBe('calendar_unverified');
    expect(
      (
        await admin('patch', `/apartments/${apartmentId}/pricing`).send({
          requireExternalSync: false,
        })
      ).status,
    ).toBe(200);
  });
  it('enforces capacity, stay length, notice, booking window, and listing status', async () => {
    const quote = (checkIn: string, checkOut: string, guests = 2) =>
      request(app)
        .post('/api/v1/quotes')
        .send({ apartmentId, checkIn, checkOut, guests });
    expect((await quote('2026-12-10', '2026-12-11', 3)).status).toBe(409);
    await admin('patch', `/apartments/${apartmentId}/pricing`).send({
      minStayNights: 2,
      maxStayNights: 3,
    });
    expect((await quote('2026-12-10', '2026-12-11')).status).toBe(409);
    expect((await quote('2026-12-10', '2026-12-14')).status).toBe(409);
    await admin('patch', `/apartments/${apartmentId}/pricing`).send({
      advanceNoticeDays: 22,
    });
    expect((await quote('2026-12-10', '2026-12-12')).status).toBe(409);
    await admin('patch', `/apartments/${apartmentId}/pricing`).send({
      advanceNoticeDays: null,
      bookingWindowDays: 10,
    });
    expect((await quote('2026-12-10', '2026-12-12')).status).toBe(409);
    await admin('patch', `/apartments/${apartmentId}/pricing`).send({
      minStayNights: 1,
      maxStayNights: null,
      bookingWindowDays: null,
    });
    await db.apartment.update({
      where: { id: apartmentId },
      data: { status: 'DRAFT' },
    });
    expect((await quote('2026-12-10', '2026-12-12')).status).toBe(409);
    await db.apartment.update({
      where: { id: apartmentId },
      data: { status: 'PUBLISHED' },
    });
  });
  it('persists blocks, checks half-open overlap, and enforces admin authorization', async () => {
    expect(
      (
        await request(app)
          .post(`/api/v1/admin/apartments/${apartmentId}/blocks`)
          .send({
            startDate: '2026-12-10',
            endDate: '2026-12-12',
            reason: 'OTHER',
          })
      ).status,
    ).toBe(401);
    const created = await admin(
      'post',
      `/apartments/${apartmentId}/blocks`,
    ).send({
      startDate: '2026-12-10',
      endDate: '2026-12-12',
      reason: 'MAINTENANCE',
      notes: 'private note',
    });
    expect(created.status).toBe(201);
    expect(
      (
        await request(app).post('/api/v1/quotes').send({
          apartmentId,
          checkIn: '2026-12-11',
          checkOut: '2026-12-12',
          guests: 2,
        })
      ).status,
    ).toBe(409);
    const calendar = await request(app).get(
      '/api/v1/apartments/m2-test-apartment/availability?startDate=2026-12-11&endDate=2026-12-13',
    );
    expect(calendar.body.days).toEqual([
      { date: '2026-12-11', available: false },
      { date: '2026-12-12', available: true },
    ]);
    expect(JSON.stringify(calendar.body)).not.toContain('private note');
    expect(
      (
        await admin(
          'delete',
          `/apartments/${apartmentId}/blocks/${created.body.id}`,
        )
      ).status,
    ).toBe(200);
  });
  it('calculates and persists price overrides and nonstacking discounts', async () => {
    expect(
      (
        await admin(
          'put',
          `/apartments/${apartmentId}/pricing/overrides/2026-12-10`,
        ).send({ nightlyRateMinor: 15000 })
      ).status,
    ).toBe(200);
    expect(
      (
        await admin(
          'put',
          `/apartments/${apartmentId}/pricing/discounts/2`,
        ).send({ discountBps: 1000 })
      ).status,
    ).toBe(200);
    const quote = await request(app).post('/api/v1/quotes').send({
      apartmentId,
      checkIn: '2026-12-10',
      checkOut: '2026-12-12',
      guests: 2,
    });
    expect(quote.status).toBe(200);
    expect(quote.body).toMatchObject({
      accommodationSubtotalMinor: 25000,
      discountTotalMinor: 2500,
      accommodationTotalMinor: 22500,
      nonBinding: true,
    });
  });
  it('reconciles imports only after successful parsing and retains old events on failure', async () => {
    const connection = await admin(
      'post',
      `/apartments/${apartmentId}/calendar-connections`,
    ).send({ url: 'https://www.airbnb.com/calendar/test.ics' });
    expect(connection.status).toBe(201);
    expect(JSON.stringify(connection.body)).not.toContain('test.ics');
    expect(
      (
        await admin(
          'post',
          `/apartments/${apartmentId}/calendar-connections/${connection.body.id}/sync`,
        )
      ).status,
    ).toBe(200);
    expect(
      await db.externalCalendarEvent.count({
        where: { calendarConnectionId: connection.body.id },
      }),
    ).toBe(1);
    const updated = new CalendarSyncService(
      db,
      async () =>
        'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:airbnb-1\r\nDTSTART;VALUE=DATE:20261221\r\nDTEND;VALUE=DATE:20261223\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n',
      clock,
    );
    await updated.sync(connection.body.id);
    expect(
      (
        await db.externalCalendarEvent.findFirstOrThrow({
          where: { calendarConnectionId: connection.body.id },
        })
      ).startDate
        .toISOString()
        .slice(0, 10),
    ).toBe('2026-12-21');
    await new CalendarSyncService(
      db,
      async () => 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n',
      clock,
    ).sync(connection.body.id);
    expect(
      await db.externalCalendarEvent.count({
        where: { calendarConnectionId: connection.body.id },
      }),
    ).toBe(0);
    await sync.sync(connection.body.id);
    const failing = new CalendarSyncService(db, async () => 'invalid', clock);
    await expect(failing.sync(connection.body.id)).rejects.toThrow();
    expect(
      await db.externalCalendarEvent.count({
        where: { calendarConnectionId: connection.body.id },
      }),
    ).toBe(1);
    const blocked = await request(app).post('/api/v1/quotes').send({
      apartmentId,
      checkIn: '2026-12-20',
      checkOut: '2026-12-21',
      guests: 2,
    });
    expect(blocked.status).toBe(409);
    const status = await admin(
      'get',
      `/apartments/${apartmentId}/calendar-connections`,
    );
    expect(status.body[0]).toMatchObject({
      syncStatus: 'FAILED',
      fresh: false,
      importedEventCount: 1,
    });
    expect(await sync.syncAll()).toEqual([
      { id: connection.body.id, status: 'success', importedEventCount: 1 },
    ]);
  });
  it('exports manual blocks only and rotates secret tokens', async () => {
    await admin('post', `/apartments/${apartmentId}/blocks`).send({
      startDate: '2026-12-26',
      endDate: '2026-12-28',
      reason: 'OTHER',
      notes: 'never export',
    });
    const first = await admin(
      'post',
      `/apartments/${apartmentId}/export-token`,
    );
    expect(first.status).toBe(201);
    const feed = await request(app).get(first.body.path);
    expect(feed.status).toBe(200);
    expect(feed.text).toContain('SUMMARY:Unavailable');
    expect(feed.text).not.toContain('never export');
    expect(feed.text).not.toContain('airbnb-1');
    const parsed = new ICAL.Component(ICAL.parse(feed.text));
    expect(parsed.getAllSubcomponents('vevent')).toHaveLength(1);
    const second = await admin(
      'post',
      `/apartments/${apartmentId}/export-token`,
    );
    expect(second.body.token).not.toBe(first.body.token);
    expect((await request(app).get(first.body.path)).status).toBe(404);
    expect((await request(app).get(second.body.path)).status).toBe(200);
  });
});
