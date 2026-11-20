import { randomBytes, createHash } from 'node:crypto';
import type { PrismaClient } from '@kasvin/database';
import { ApiError } from '../../middleware/error.js';
import {
  accraToday,
  addDays,
  formatDate,
  interval,
  overlap,
  parseDate,
} from './dates.js';
import { priceStay } from './pricing.js';

type Stay = ReturnType<typeof interval>;
type Clock = () => Date;

export class AvailabilityService {
  constructor(
    private readonly db: PrismaClient,
    private readonly now: Clock = () => new Date(),
  ) {}

  private async apartment(id: string) {
    const apartment = await this.db.apartment.findUnique({ where: { id } });
    if (!apartment) throw new ApiError(404, 'not_found', 'Apartment not found');
    return apartment;
  }

  private async context(id: string, stay: Stay) {
    const [apartment, settings, blocks, connections] = await Promise.all([
      this.apartment(id),
      this.db.apartmentPricingSettings.findUnique({
        where: { apartmentId: id },
      }),
      this.db.manualAvailabilityBlock.findMany({
        where: {
          apartmentId: id,
          removedAt: null,
          startDate: { lt: stay.end },
          endDate: { gt: stay.start },
        },
      }),
      this.db.calendarConnection.findMany({
        where: { apartmentId: id, enabled: true },
        include: {
          events: {
            where: { startDate: { lt: stay.end }, endDate: { gt: stay.start } },
          },
        },
      }),
    ]);
    return { apartment, settings, blocks, connections };
  }

  async evaluate(id: string, stay: Stay, guests?: number) {
    const { apartment, settings, blocks, connections } = await this.context(
      id,
      stay,
    );
    let reason: string | null = null;
    if (apartment.status !== 'PUBLISHED') reason = 'listing_unavailable';
    else if (
      guests != null &&
      apartment.maximumGuests != null &&
      guests > apartment.maximumGuests
    )
      reason = 'capacity_exceeded';
    else if (
      stay.nights < (settings?.minStayNights ?? 1) ||
      (settings?.maxStayNights != null && stay.nights > settings.maxStayNights)
    )
      reason = 'stay_restriction';
    else if (
      settings?.advanceNoticeDays != null &&
      stay.start < addDays(accraToday(this.now()), settings.advanceNoticeDays)
    )
      reason = 'advance_notice';
    else if (
      settings?.bookingWindowDays != null &&
      stay.start >= addDays(accraToday(this.now()), settings.bookingWindowDays)
    )
      reason = 'booking_window';
    else if (
      blocks.length ||
      connections.some((connection) => connection.events.length)
    )
      reason = 'dates_unavailable';
    else if (settings?.requireExternalSync ?? true) {
      if (
        !connections.length ||
        connections.some(
          (connection) =>
            connection.syncStatus !== 'SUCCESS' ||
            !connection.lastSuccessfulSyncAt ||
            this.now().getTime() - connection.lastSuccessfulSyncAt.getTime() >
              (settings?.freshnessMinutes ?? 240) * 60_000,
        )
      )
        reason = 'calendar_unverified';
    }
    return { apartmentId: id, available: reason === null, reason };
  }

  async search(checkIn: unknown, checkOut: unknown, guests: number) {
    const stay = interval(checkIn, checkOut, this.now());
    const apartments = await this.db.apartment.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [{ maximumGuests: null }, { maximumGuests: { gte: guests } }],
      },
      orderBy: { code: 'asc' },
    });
    const results = await Promise.all(
      apartments.map(async (apartment) => ({
        id: apartment.id,
        slug: apartment.slug,
        name: apartment.name,
        currency: apartment.currency,
        ...(await this.evaluate(apartment.id, stay, guests)),
      })),
    );
    return {
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      guests,
      apartments: results,
    };
  }

  async calendar(
    id: string,
    startDate: unknown,
    endDate: unknown,
    admin = false,
  ): Promise<unknown> {
    const stay = interval(startDate, endDate, this.now());
    const { apartment, settings, blocks, connections } = await this.context(
      id,
      stay,
    );
    if (!admin && apartment.status !== 'PUBLISHED')
      throw new ApiError(404, 'not_found', 'Apartment not found');
    const external = connections.flatMap((connection) => connection.events);
    const syncFresh =
      !(settings?.requireExternalSync ?? true) ||
      (connections.length > 0 &&
        connections.every(
          (connection) =>
            connection.syncStatus === 'SUCCESS' &&
            connection.lastSuccessfulSyncAt &&
            this.now().getTime() - connection.lastSuccessfulSyncAt.getTime() <=
              (settings?.freshnessMinutes ?? 240) * 60_000,
        ));
    const days = Array.from({ length: stay.nights }, (_, index) => {
      const day = addDays(stay.start, index);
      const next = addDays(day, 1);
      const blocked =
        blocks.some((block) =>
          overlap(day, next, block.startDate, block.endDate),
        ) ||
        external.some((event) =>
          overlap(day, next, event.startDate, event.endDate),
        );
      return {
        date: formatDate(day),
        available: apartment.status === 'PUBLISHED' && syncFresh && !blocked,
      };
    });
    return admin
      ? { apartmentId: id, days, blocks, syncFresh }
      : { apartmentId: id, days, syncFresh };
  }

  async publicCalendar(
    slug: string,
    startDate: unknown,
    endDate: unknown,
  ): Promise<unknown> {
    const apartment = await this.db.apartment.findFirst({
      where: { slug, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!apartment) throw new ApiError(404, 'not_found', 'Apartment not found');
    return this.calendar(apartment.id, startDate, endDate);
  }

  async quote(
    id: string,
    checkIn: unknown,
    checkOut: unknown,
    guests: number,
    preview = false,
  ) {
    const stay = interval(checkIn, checkOut, this.now(), 90);
    const apartment = await this.apartment(id);
    if (!preview) {
      const result = await this.evaluate(id, stay, guests);
      if (!result.available)
        throw new ApiError(
          result.reason === 'calendar_unverified' ? 503 : 409,
          result.reason!,
          'Stay cannot be quoted as available',
        );
    }
    const [overrides, weekdays, discounts] = await Promise.all([
      this.db.nightlyRateOverride.findMany({
        where: { apartmentId: id, date: { gte: stay.start, lt: stay.end } },
      }),
      this.db.weekdayRate.findMany({ where: { apartmentId: id } }),
      this.db.lengthOfStayDiscount.findMany({ where: { apartmentId: id } }),
    ]);
    return {
      apartmentId: id,
      apartmentName: apartment.name,
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      nights: stay.nights,
      guests,
      currency: apartment.currency,
      ...priceStay({
        start: stay.start,
        nights: stay.nights,
        baseRate: apartment.baseNightlyRateMinor,
        overrides,
        weekdays,
        discounts,
      }),
      createdAt: this.now().toISOString(),
      nonBinding: true,
    };
  }

  async listBlocks(id: string): Promise<unknown> {
    await this.apartment(id);
    return this.db.manualAvailabilityBlock.findMany({
      where: { apartmentId: id, removedAt: null },
      orderBy: { startDate: 'asc' },
    });
  }

  async createBlock(
    id: string,
    input: {
      startDate: string;
      endDate: string;
      reason: 'MAINTENANCE' | 'OWNER_USE' | 'CLEANING' | 'OTHER';
      notes?: string | undefined;
    },
  ): Promise<unknown> {
    const apartment = await this.apartment(id);
    if (apartment.status === 'ARCHIVED')
      throw new ApiError(
        409,
        'archived',
        'Archived apartment cannot be changed',
      );
    const start = parseDate(input.startDate),
      end = parseDate(input.endDate);
    if (start >= end)
      throw new ApiError(
        400,
        'invalid_interval',
        'End date must follow start date',
      );
    if (end <= accraToday(this.now()))
      throw new ApiError(400, 'past_date', 'Cannot create a historical block');
    return this.db.manualAvailabilityBlock.create({
      data: {
        apartmentId: id,
        startDate: start,
        endDate: end,
        reason: input.reason,
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
    });
  }

  async updateBlock(
    id: string,
    blockId: string,
    input: {
      startDate?: string | undefined;
      endDate?: string | undefined;
      reason?: 'MAINTENANCE' | 'OWNER_USE' | 'CLEANING' | 'OTHER' | undefined;
      notes?: string | null | undefined;
    },
  ): Promise<unknown> {
    const existing = await this.db.manualAvailabilityBlock.findFirst({
      where: { id: blockId, apartmentId: id, removedAt: null },
    });
    if (!existing) throw new ApiError(404, 'not_found', 'Block not found');
    const start = input.startDate
      ? parseDate(input.startDate)
      : existing.startDate;
    const end = input.endDate ? parseDate(input.endDate) : existing.endDate;
    if (start >= end || end <= accraToday(this.now()))
      throw new ApiError(400, 'invalid_interval', 'Invalid block interval');
    return this.db.manualAvailabilityBlock.update({
      where: { id: blockId },
      data: {
        startDate: start,
        endDate: end,
        ...(input.reason !== undefined ? { reason: input.reason } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
    });
  }

  async removeBlock(id: string, blockId: string) {
    const result = await this.db.manualAvailabilityBlock.updateMany({
      where: { id: blockId, apartmentId: id, removedAt: null },
      data: { removedAt: this.now() },
    });
    if (!result.count) throw new ApiError(404, 'not_found', 'Block not found');
    return { removed: true };
  }

  async pricing(id: string) {
    const apartment = await this.apartment(id);
    const [settings, overrides, weekdays, discounts] = await Promise.all([
      this.db.apartmentPricingSettings.findUnique({
        where: { apartmentId: id },
      }),
      this.db.nightlyRateOverride.findMany({
        where: { apartmentId: id },
        orderBy: { date: 'asc' },
      }),
      this.db.weekdayRate.findMany({
        where: { apartmentId: id },
        orderBy: { weekday: 'asc' },
      }),
      this.db.lengthOfStayDiscount.findMany({
        where: { apartmentId: id },
        orderBy: { minNights: 'asc' },
      }),
    ]);
    return {
      apartmentId: id,
      baseNightlyRateMinor: apartment.baseNightlyRateMinor,
      currency: apartment.currency,
      settings: settings ?? {
        minStayNights: 1,
        maxStayNights: null,
        advanceNoticeDays: null,
        bookingWindowDays: null,
        requireExternalSync: true,
        freshnessMinutes: 240,
      },
      overrides,
      weekdays,
      discounts,
    };
  }

  async updatePricing(
    id: string,
    input: {
      baseNightlyRateMinor?: number | null | undefined;
      minStayNights?: number | undefined;
      maxStayNights?: number | null | undefined;
      advanceNoticeDays?: number | null | undefined;
      bookingWindowDays?: number | null | undefined;
      requireExternalSync?: boolean | undefined;
      freshnessMinutes?: number | undefined;
    },
  ) {
    await this.apartment(id);
    const current = await this.db.apartmentPricingSettings.findUnique({
      where: { apartmentId: id },
    });
    const minimum = input.minStayNights ?? current?.minStayNights ?? 1;
    const maximum =
      input.maxStayNights === undefined
        ? current?.maxStayNights
        : input.maxStayNights;
    if (maximum != null && maximum < minimum)
      throw new ApiError(
        400,
        'invalid_stay_rules',
        'Maximum stay must be at least minimum stay',
      );
    const { baseNightlyRateMinor, ...rawSettings } = input;
    const settings = Object.fromEntries(
      Object.entries(rawSettings).filter(([, value]) => value !== undefined),
    );
    await this.db.$transaction(async (tx) => {
      if (baseNightlyRateMinor !== undefined)
        await tx.apartment.update({
          where: { id },
          data: { baseNightlyRateMinor },
        });
      if (Object.keys(settings).length)
        await tx.apartmentPricingSettings.upsert({
          where: { apartmentId: id },
          create: { apartmentId: id, ...settings },
          update: settings,
        });
    });
    return this.pricing(id);
  }

  async setOverride(id: string, date: string, nightlyRateMinor: number) {
    await this.apartment(id);
    return this.db.nightlyRateOverride.upsert({
      where: { apartmentId_date: { apartmentId: id, date: parseDate(date) } },
      create: { apartmentId: id, date: parseDate(date), nightlyRateMinor },
      update: { nightlyRateMinor },
    });
  }
  async removeOverride(id: string, date: string) {
    await this.db.nightlyRateOverride.deleteMany({
      where: { apartmentId: id, date: parseDate(date) },
    });
    return { removed: true };
  }
  async setWeekday(id: string, weekday: number, nightlyRateMinor: number) {
    await this.apartment(id);
    return this.db.weekdayRate.upsert({
      where: { apartmentId_weekday: { apartmentId: id, weekday } },
      create: { apartmentId: id, weekday, nightlyRateMinor },
      update: { nightlyRateMinor },
    });
  }
  async removeWeekday(id: string, weekday: number) {
    await this.db.weekdayRate.deleteMany({
      where: { apartmentId: id, weekday },
    });
    return { removed: true };
  }
  async setDiscount(id: string, minNights: number, discountBps: number) {
    await this.apartment(id);
    return this.db.lengthOfStayDiscount.upsert({
      where: { apartmentId_minNights: { apartmentId: id, minNights } },
      create: { apartmentId: id, minNights, discountBps },
      update: { discountBps },
    });
  }
  async removeDiscount(id: string, minNights: number) {
    await this.db.lengthOfStayDiscount.deleteMany({
      where: { apartmentId: id, minNights },
    });
    return { removed: true };
  }

  async rotateToken(id: string) {
    await this.apartment(id);
    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await this.db.calendarExportToken.upsert({
      where: { apartmentId: id },
      create: { apartmentId: id, tokenHash },
      update: { tokenHash, createdAt: this.now() },
    });
    return { token, path: `/api/v1/calendars/export/${token}.ics` };
  }
  async revokeToken(id: string) {
    await this.db.calendarExportToken.deleteMany({
      where: { apartmentId: id },
    });
    return { revoked: true };
  }
  async exportCalendar(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const record = await this.db.calendarExportToken.findUnique({
      where: { tokenHash },
    });
    if (!record) throw new ApiError(404, 'not_found', 'Calendar not found');
    const blocks = await this.db.manualAvailabilityBlock.findMany({
      where: {
        apartmentId: record.apartmentId,
        removedAt: null,
        endDate: { gt: accraToday(this.now()) },
      },
      orderBy: { startDate: 'asc' },
    });
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kasvin Homes//Availability//EN',
      'CALSCALE:GREGORIAN',
    ];
    for (const block of blocks)
      lines.push(
        'BEGIN:VEVENT',
        `UID:${block.id}@kasvin-homes`,
        `DTSTAMP:${block.updatedAt
          .toISOString()
          .replace(/[-:]/g, '')
          .replace(/\.\d{3}/, '')}`,
        `DTSTART;VALUE=DATE:${formatDate(block.startDate).replaceAll('-', '')}`,
        `DTEND;VALUE=DATE:${formatDate(block.endDate).replaceAll('-', '')}`,
        'SUMMARY:Unavailable',
        'END:VEVENT',
      );
    return [...lines, 'END:VCALENDAR', ''].join('\r\n');
  }
}
