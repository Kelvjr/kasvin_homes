import type { PrismaClient } from '@kasvin/database';
import {
  accraToday,
  addDays,
  formatDate,
} from '../../modules/availability/dates.js';

export const M3_FIXTURE_NOW = new Date('2027-01-15T12:00:00.000Z');
const fixtureCodes = [
  'M3_FIXTURE_AVAILABLE',
  'M3_FIXTURE_MANUAL_BLOCKED',
  'M3_FIXTURE_EXTERNAL_BLOCKED',
  'M3_FIXTURE_STALE',
  'M3_FIXTURE_DRAFT',
  'M3_FIXTURE_UNAVAILABLE',
] as const;

export function assertM3TestDatabaseUrl(raw: string): string {
  const url = new URL(raw);
  const database = url.pathname.slice(1);
  if (
    url.hostname !== '127.0.0.1' ||
    !/^kasvin_m3_[a-z0-9_]+_test$/.test(database)
  )
    throw new Error(
      'M3 fixtures require an isolated local kasvin_m3_*_test database',
    );
  return database;
}

export async function createM3ApartmentFixtures(
  db: PrismaClient,
  databaseUrl: string,
  now: Date = M3_FIXTURE_NOW,
) {
  const expectedDatabase = assertM3TestDatabaseUrl(databaseUrl);
  const result = await db.$queryRaw<
    Array<{ name: string }>
  >`SELECT current_database() AS name`;
  if (result[0]?.name !== expectedDatabase)
    throw new Error(
      'Connected database does not match the isolated M3 test URL',
    );

  const today = accraToday(now);
  const manualStart = addDays(today, 10);
  const manualEnd = addDays(today, 12);
  const externalStart = addDays(today, 15);
  const externalEnd = addDays(today, 17);

  const apartments = await db.$transaction(async (tx) => {
    await tx.apartment.deleteMany({
      where: { code: { in: [...fixtureCodes] } },
    });
    const create = async (
      code: (typeof fixtureCodes)[number],
      status: 'PUBLISHED' | 'DRAFT' | 'UNAVAILABLE',
      bedrooms = 1,
      maximumGuests = 3,
    ) =>
      tx.apartment.create({
        data: {
          code,
          slug: code.toLowerCase().replaceAll('_', '-'),
          name: `Synthetic ${code}`,
          bedrooms,
          maximumGuests,
          baseNightlyRateMinor: 10000,
          currency: 'GHS',
          status,
          ...(status !== 'DRAFT' ? { publishedAt: now } : {}),
        },
      });

    const available = await create('M3_FIXTURE_AVAILABLE', 'PUBLISHED');
    const manualBlocked = await create(
      'M3_FIXTURE_MANUAL_BLOCKED',
      'PUBLISHED',
    );
    const externalBlocked = await create(
      'M3_FIXTURE_EXTERNAL_BLOCKED',
      'PUBLISHED',
    );
    const stale = await create('M3_FIXTURE_STALE', 'PUBLISHED');
    const draft = await create('M3_FIXTURE_DRAFT', 'DRAFT');
    const unavailable = await create(
      'M3_FIXTURE_UNAVAILABLE',
      'UNAVAILABLE',
      2,
      5,
    );

    for (const apartment of [
      available,
      manualBlocked,
      externalBlocked,
      draft,
      unavailable,
    ])
      await tx.apartmentPricingSettings.create({
        data: { apartmentId: apartment.id, requireExternalSync: false },
      });
    await tx.apartmentPricingSettings.create({
      data: {
        apartmentId: stale.id,
        requireExternalSync: true,
        freshnessMinutes: 240,
      },
    });
    await tx.manualAvailabilityBlock.create({
      data: {
        apartmentId: manualBlocked.id,
        startDate: manualStart,
        endDate: manualEnd,
        reason: 'OTHER',
        notes: 'Synthetic test block',
      },
    });
    const freshConnection = await tx.calendarConnection.create({
      data: {
        apartmentId: externalBlocked.id,
        url: 'https://calendar.example.com/synthetic.ics',
        lastSuccessfulSyncAt: now,
        syncStatus: 'SUCCESS',
      },
    });
    await tx.externalCalendarEvent.create({
      data: {
        calendarConnectionId: freshConnection.id,
        externalUid: 'synthetic-occupied@kasvin.test',
        startDate: externalStart,
        endDate: externalEnd,
      },
    });
    await tx.calendarConnection.create({
      data: {
        apartmentId: stale.id,
        url: 'https://calendar.example.com/stale.ics',
        lastSuccessfulSyncAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        syncStatus: 'SUCCESS',
      },
    });
    return {
      available,
      manualBlocked,
      externalBlocked,
      stale,
      draft,
      unavailable,
    };
  });

  return {
    apartments,
    dates: {
      today: formatDate(today),
      manualStart: formatDate(manualStart),
      manualEnd: formatDate(manualEnd),
      externalStart: formatDate(externalStart),
      externalEnd: formatDate(externalEnd),
    },
  };
}
