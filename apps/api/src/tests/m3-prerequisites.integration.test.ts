import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closeDatabaseConnection, getDatabaseClient } from '@kasvin/database';
import { createApp } from '../app.js';
import { parseConfig } from '../config/env.js';
import { ApartmentService } from '../modules/apartments/apartment.service.js';
import { AvailabilityService } from '../modules/availability/availability.service.js';
import { CalendarSyncService } from '../modules/availability/calendar.sync.js';
import {
  addDays,
  formatDate,
  parseDate,
} from '../modules/availability/dates.js';
import {
  assertM3TestDatabaseUrl,
  createM3ApartmentFixtures,
  M3_FIXTURE_NOW,
} from './fixtures/m3-apartments.js';

const url = process.env.M3_TEST_DATABASE_URL;
if (url) assertM3TestDatabaseUrl(url);
const token = 'm3_prerequisite_test_token_0123456789abcdef';

describe.skipIf(!url)(
  'M3 prerequisites using M2 APIs and isolated PostgreSQL',
  () => {
    const testUrl = url ?? 'postgresql://127.0.0.1/kasvin_m3_unused_test';
    const db = getDatabaseClient(testUrl);
    const app = createApp(
      parseConfig({
        NODE_ENV: 'test',
        DATABASE_URL: testUrl,
        CORS_ORIGINS: 'http://localhost:3000',
        DEV_ADMIN_TOKEN: token,
      }),
      async () => {},
      new ApartmentService(db),
      new AvailabilityService(db, () => M3_FIXTURE_NOW),
      new CalendarSyncService(
        db,
        async () => {
          throw new Error('Live calendar fetch is forbidden in fixture tests');
        },
        () => M3_FIXTURE_NOW,
      ),
    );
    let fixtures: Awaited<ReturnType<typeof createM3ApartmentFixtures>>;
    const quote = (
      apartmentId: string,
      checkIn: string,
      checkOut: string,
      guests = 1,
    ) =>
      request(app)
        .post('/api/v1/quotes')
        .send({ apartmentId, checkIn, checkOut, guests });
    const admin = (method: 'patch' | 'put', path: string) =>
      request(app)
        [method](`/api/v1/admin${path}`)
        .set('Authorization', `Bearer ${token}`);

    beforeAll(async () => {
      fixtures = await createM3ApartmentFixtures(db, testUrl);
    });
    afterAll(async () => {
      await closeDatabaseConnection();
    });

    it('guards the test database and creates valid synthetic listing states', async () => {
      expect(() =>
        assertM3TestDatabaseUrl('postgresql://127.0.0.1/kasvin_homes'),
      ).toThrow();
      expect(() =>
        assertM3TestDatabaseUrl(
          'postgresql://db.example.com/kasvin_m3_demo_test',
        ),
      ).toThrow();
      const { available, draft, unavailable } = fixtures.apartments;
      expect(available.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(available).toMatchObject({
        bedrooms: 1,
        maximumGuests: 3,
        baseNightlyRateMinor: 10000,
        status: 'PUBLISHED',
        currency: 'GHS',
      });
      expect(draft.status).toBe('DRAFT');
      expect(unavailable).toMatchObject({
        bedrooms: 2,
        maximumGuests: 5,
        status: 'UNAVAILABLE',
      });
      expect(
        await db.apartment.count({
          where: { code: { startsWith: 'M3_FIXTURE_' } },
        }),
      ).toBe(6);
    });

    it('selects by UUID and enforces capacity and listing status', async () => {
      const { available, draft, unavailable } = fixtures.apartments;
      const checkIn = formatDate(addDays(parseDate(fixtures.dates.today), 2));
      const checkOut = formatDate(addDays(parseDate(checkIn), 1));
      expect((await quote(available.id, checkIn, checkOut, 3)).status).toBe(
        200,
      );
      expect((await quote(available.id, checkIn, checkOut, 4)).body.error).toBe(
        'capacity_exceeded',
      );
      expect((await quote(draft.id, checkIn, checkOut)).body.error).toBe(
        'listing_unavailable',
      );
      expect((await quote(unavailable.id, checkIn, checkOut)).body.error).toBe(
        'listing_unavailable',
      );
      expect(
        (await quote('00000000-0000-4000-8000-000000000000', checkIn, checkOut))
          .status,
      ).toBe(404);
    });

    it('validates Accra dates and minimum/maximum stay rules', async () => {
      const id = fixtures.apartments.available.id;
      const start = formatDate(addDays(parseDate(fixtures.dates.today), 2));
      expect((await quote(id, start, start)).status).toBe(400);
      expect((await quote(id, '2027-02-30', '2027-03-02')).status).toBe(400);
      expect((await quote(id, '2027-01-14', '2027-01-16')).status).toBe(400);
      const rules = await admin('patch', `/apartments/${id}/pricing`).send({
        minStayNights: 2,
        maxStayNights: 3,
      });
      expect(rules.status).toBe(200);
      try {
        expect(
          (await quote(id, start, formatDate(addDays(parseDate(start), 1))))
            .body.error,
        ).toBe('stay_restriction');
        expect(
          (await quote(id, start, formatDate(addDays(parseDate(start), 2))))
            .status,
        ).toBe(200);
        expect(
          (await quote(id, start, formatDate(addDays(parseDate(start), 4))))
            .body.error,
        ).toBe('stay_restriction');
      } finally {
        await admin('patch', `/apartments/${id}/pricing`).send({
          minStayNights: 1,
          maxStayNights: null,
        });
      }
    });

    it('treats adjacent checkout as available and any overlap as blocked', async () => {
      const { available, manualBlocked, externalBlocked } = fixtures.apartments;
      const { manualStart, manualEnd, externalStart, externalEnd } =
        fixtures.dates;
      const beforeManual = formatDate(addDays(parseDate(manualStart), -1));
      const afterManual = formatDate(addDays(parseDate(manualEnd), 1));
      expect(
        (await quote(manualBlocked.id, beforeManual, manualStart)).status,
      ).toBe(200);
      expect(
        (await quote(manualBlocked.id, manualEnd, afterManual)).status,
      ).toBe(200);
      expect(
        (
          await quote(
            manualBlocked.id,
            beforeManual,
            formatDate(addDays(parseDate(manualStart), 1)),
          )
        ).body.error,
      ).toBe('dates_unavailable');
      expect((await quote(available.id, manualStart, manualEnd)).status).toBe(
        200,
      );
      expect(
        (await quote(externalBlocked.id, externalStart, externalEnd)).body
          .error,
      ).toBe('dates_unavailable');
      expect(
        (
          await quote(
            externalBlocked.id,
            externalEnd,
            formatDate(addDays(parseDate(externalEnd), 1)),
          )
        ).status,
      ).toBe(200);
    });

    it('fails closed for a stale required calendar', async () => {
      const start = formatDate(addDays(parseDate(fixtures.dates.today), 2));
      const response = await quote(
        fixtures.apartments.stale.id,
        start,
        formatDate(addDays(parseDate(start), 1)),
      );
      expect(response.status).toBe(503);
      expect(response.body.error).toBe('calendar_unverified');
    });

    it('quotes the highest eligible nonstacking discount across each threshold', async () => {
      const id = fixtures.apartments.available.id;
      const rules = [
        { minNights: 3, discountBps: 500 },
        { minNights: 5, discountBps: 1000 },
        { minNights: 7, discountBps: 1500 },
        { minNights: 30, discountBps: 3000 },
      ];
      for (const rule of rules) {
        const response = await admin(
          'put',
          `/apartments/${id}/pricing/discounts/${rule.minNights}`,
        ).send({ discountBps: rule.discountBps });
        expect(response.status).toBe(200);
      }
      expect(
        (
          await admin('put', `/apartments/${id}/pricing/discounts/31`).send({
            discountBps: 3001,
          })
        ).status,
      ).toBe(400);
      await expect(
        db.lengthOfStayDiscount.create({
          data: { apartmentId: id, minNights: 31, discountBps: 3001 },
        }),
      ).rejects.toThrow();
      const start = formatDate(addDays(parseDate(fixtures.dates.today), 20));
      for (const nights of [1, 2, 3, 4, 5, 6, 7, 29, 30]) {
        const response = await quote(
          id,
          start,
          formatDate(addDays(parseDate(start), nights)),
          3,
        );
        const selected = rules
          .filter((rule) => rule.minNights <= nights)
          .at(-1);
        const subtotal = nights * 10000;
        const discount = Math.floor(
          (subtotal * (selected?.discountBps ?? 0) + 5000) / 10000,
        );
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
          nights,
          accommodationSubtotalMinor: subtotal,
          discountTotalMinor: discount,
          accommodationTotalMinor: subtotal - discount,
          nonBinding: true,
        });
        expect(response.body.nightly).toHaveLength(nights);
        expect(response.body.appliedDiscount?.discountBps ?? 0).toBe(
          selected?.discountBps ?? 0,
        );
      }
    });
  },
);
