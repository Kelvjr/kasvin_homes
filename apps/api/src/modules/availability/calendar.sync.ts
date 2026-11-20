import { randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import https from 'node:https';
import { BlockList, isIP } from 'node:net';
import ICAL from 'ical.js';
import type { PrismaClient } from '@kasvin/database';
import { ApiError } from '../../middleware/error.js';
import { addDays, formatDate, parseDate } from './dates.js';

export interface ImportedEvent {
  uid: string;
  startDate: Date;
  endDate: Date;
}

export function parseCalendar(body: string): ImportedEvent[] {
  if (!body.startsWith('BEGIN:VCALENDAR') || !body.includes('END:VCALENDAR'))
    throw new Error('invalid_calendar');
  const component = new ICAL.Component(ICAL.parse(body));
  const events = new Map<string, ImportedEvent>();
  for (const item of component.getAllSubcomponents('vevent')) {
    if (events.size >= 5000) throw new Error('too_many_events');
    if (
      item.hasProperty('rrule') ||
      item.hasProperty('rdate') ||
      item.hasProperty('exdate') ||
      item.hasProperty('recurrence-id')
    )
      throw new Error('unsupported_recurrence');
    const uid = item.getFirstPropertyValue('uid');
    if (typeof uid !== 'string' || !uid || uid.length > 512)
      throw new Error('invalid_event');
    if (item.getFirstPropertyValue('status') === 'CANCELLED') {
      events.delete(uid);
      continue;
    }
    const startProperty = item.getFirstProperty('dtstart');
    const endProperty = item.getFirstProperty('dtend');
    if (!startProperty || !endProperty) throw new Error('invalid_event');
    for (const property of [startProperty, endProperty]) {
      const tzid = property.getParameter('tzid');
      if (
        tzid &&
        !component
          .getAllSubcomponents('vtimezone')
          .some((zone) => zone.getFirstPropertyValue('tzid') === tzid)
      )
        throw new Error('unknown_timezone');
    }
    const start = startProperty.getFirstValue() as ICAL.Time;
    const end = endProperty.getFirstValue() as ICAL.Time;
    if (start.isDate !== end.isDate) throw new Error('invalid_event');
    if (
      !start.isDate &&
      ((!startProperty.getParameter('tzid') &&
        !start.toString().endsWith('Z')) ||
        (!endProperty.getParameter('tzid') && !end.toString().endsWith('Z')))
    )
      throw new Error('floating_time');
    const startUtc = start.toJSDate();
    const endUtc = end.toJSDate();
    if (!(startUtc < endUtc)) throw new Error('invalid_event');
    // Any occupied portion of a civil day blocks that night in Accra (UTC).
    const startDate = parseDate(formatDate(startUtc));
    const endDate =
      endUtc.getTime() % 86_400_000 === 0
        ? parseDate(formatDate(endUtc))
        : addDays(parseDate(formatDate(endUtc)), 1);
    const existing = events.get(uid);
    if (
      existing &&
      (existing.startDate.getTime() !== startDate.getTime() ||
        existing.endDate.getTime() !== endDate.getTime())
    )
      throw new Error('duplicate_uid');
    events.set(uid, { uid, startDate, endDate });
  }
  return [...events.values()];
}

function publicIpv4(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const [a = 0, b = 0, c = 0] = address.split('.').map(Number);
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || (b === 0 && c === 0))) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113)
  );
}

const blockedIpv6 = new BlockList();
for (const [subnet, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['::ffff:0:0', 96],
  ['2001:db8::', 32],
  ['2001::', 32],
  ['2002::', 16],
  ['3fff::', 20],
] as const)
  blockedIpv6.addSubnet(subnet, prefix, 'ipv6');

function publicAddress(address: string): boolean {
  if (isIP(address) === 4) return publicIpv4(address);
  if (isIP(address) !== 6) return false;
  return /^[23]/i.test(address) && !blockedIpv6.check(address, 'ipv6');
}

export function validateCalendarUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ApiError(400, 'invalid_calendar_url', 'Invalid calendar URL');
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (url.port && url.port !== '443') ||
    isIP(url.hostname) ||
    url.hostname === 'localhost' ||
    url.hostname.endsWith('.localhost') ||
    url.hostname.endsWith('.local') ||
    !url.hostname.includes('.') ||
    url.hash ||
    raw.length > 2048
  )
    throw new ApiError(
      400,
      'invalid_calendar_url',
      'Calendar URL must be a public HTTPS host',
    );
  return url;
}

export async function fetchCalendar(
  raw: string,
  redirectCount = 0,
): Promise<string> {
  const url = validateCalendarUrl(raw);
  if (redirectCount > 3) throw new Error('redirect_limit');
  const addresses = await lookup(url.hostname, { all: true, verbatim: true });
  if (
    !addresses.length ||
    addresses.some((entry) => !publicAddress(entry.address))
  )
    throw new Error('unsafe_address');
  const address = addresses[0]!.address;
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        timeout: 10_000,
        lookup: (_host, _options, callback) =>
          callback(null, address, isIP(address)),
        headers: {
          Accept: 'text/calendar',
          'User-Agent': 'KasvinHomesCalendarSync/1.0',
        },
      },
      (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400
        ) {
          const location = response.headers.location;
          response.resume();
          if (!location) return reject(new Error('invalid_redirect'));
          void fetchCalendar(
            new URL(location, url).toString(),
            redirectCount + 1,
          ).then(resolve, reject);
          return;
        }
        if (response.statusCode !== 200) {
          response.resume();
          return reject(new Error('http_failure'));
        }
        const contentType = response.headers['content-type'] ?? '';
        if (
          contentType &&
          !/text\/calendar|text\/plain|application\/octet-stream/i.test(
            contentType,
          )
        ) {
          response.resume();
          return reject(new Error('unexpected_content'));
        }
        const chunks: Buffer[] = [];
        let size = 0;
        response.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > 2_000_000) {
            response.destroy(new Error('calendar_too_large'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () =>
          resolve(Buffer.concat(chunks).toString('utf8')),
        );
        response.on('error', reject);
      },
    );
    const deadline = setTimeout(
      () => request.destroy(new Error('timeout')),
      15_000,
    );
    request.on('close', () => clearTimeout(deadline));
    request.on('timeout', () => request.destroy(new Error('timeout')));
    request.on('error', reject);
  });
}

const publicConnection = {
  id: true,
  apartmentId: true,
  provider: true,
  enabled: true,
  lastAttemptAt: true,
  lastSuccessfulSyncAt: true,
  lastErrorAt: true,
  syncStatus: true,
  errorCode: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class CalendarSyncService {
  constructor(
    private readonly db: PrismaClient,
    private readonly fetcher: (url: string) => Promise<string> = fetchCalendar,
    private readonly now: () => Date = () => new Date(),
  ) {}
  async list(apartmentId: string): Promise<unknown> {
    const rows = await this.db.calendarConnection.findMany({
      where: { apartmentId },
      select: { ...publicConnection, _count: { select: { events: true } } },
      orderBy: { createdAt: 'asc' },
    });
    const settings = await this.db.apartmentPricingSettings.findUnique({
      where: { apartmentId },
    });
    return rows.map((row) => ({
      ...row,
      importedEventCount: row._count.events,
      _count: undefined,
      fresh:
        row.syncStatus === 'SUCCESS' &&
        !!row.lastSuccessfulSyncAt &&
        this.now().getTime() - row.lastSuccessfulSyncAt.getTime() <=
          (settings?.freshnessMinutes ?? 240) * 60_000,
    }));
  }
  async create(apartmentId: string, url: string): Promise<unknown> {
    validateCalendarUrl(url);
    const apartment = await this.db.apartment.findUnique({
      where: { id: apartmentId },
    });
    if (!apartment || apartment.status === 'ARCHIVED')
      throw new ApiError(404, 'not_found', 'Apartment not found');
    return this.db.calendarConnection.create({
      data: { apartmentId, url },
      select: publicConnection,
    });
  }
  async update(
    apartmentId: string,
    id: string,
    input: { enabled?: boolean | undefined; url?: string | undefined },
  ): Promise<unknown> {
    if (input.url) validateCalendarUrl(input.url);
    const row = await this.db.calendarConnection.findFirst({
      where: { id, apartmentId },
    });
    if (!row)
      throw new ApiError(404, 'not_found', 'Calendar connection not found');
    if (row.syncLeaseUntil && row.syncLeaseUntil > this.now())
      throw new ApiError(409, 'sync_busy', 'Calendar connection is syncing');
    return this.db.calendarConnection.update({
      where: { id },
      data: {
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.url && input.url !== row.url
          ? { lastSuccessfulSyncAt: null, syncStatus: 'NEVER' }
          : {}),
      },
      select: publicConnection,
    });
  }
  async remove(apartmentId: string, id: string) {
    const active = await this.db.calendarConnection.findFirst({
      where: { id, apartmentId, syncLeaseUntil: { gt: this.now() } },
    });
    if (active)
      throw new ApiError(409, 'sync_busy', 'Calendar connection is syncing');
    const result = await this.db.calendarConnection.deleteMany({
      where: { apartmentId, id },
    });
    if (!result.count)
      throw new ApiError(404, 'not_found', 'Calendar connection not found');
    return { removed: true };
  }
  async sync(id: string, apartmentId?: string) {
    const leaseOwner = randomUUID();
    const now = this.now();
    const lease = await this.db.calendarConnection.updateMany({
      where: {
        id,
        ...(apartmentId ? { apartmentId } : {}),
        enabled: true,
        OR: [{ syncLeaseUntil: null }, { syncLeaseUntil: { lt: now } }],
      },
      data: {
        syncLeaseOwner: leaseOwner,
        syncLeaseUntil: new Date(now.getTime() + 120_000),
        lastAttemptAt: now,
      },
    });
    if (!lease.count)
      throw new ApiError(
        409,
        'sync_busy',
        'Calendar connection unavailable or already syncing',
      );
    try {
      const row = await this.db.calendarConnection.findUniqueOrThrow({
        where: { id },
      });
      const events = parseCalendar(await this.fetcher(row.url));
      await this.db.$transaction(async (tx) => {
        const stillOwned = await tx.calendarConnection.findFirst({
          where: { id, syncLeaseOwner: leaseOwner },
        });
        if (!stillOwned) throw new Error('lease_lost');
        for (const event of events)
          await tx.externalCalendarEvent.upsert({
            where: {
              calendarConnectionId_externalUid: {
                calendarConnectionId: id,
                externalUid: event.uid,
              },
            },
            create: {
              calendarConnectionId: id,
              externalUid: event.uid,
              startDate: event.startDate,
              endDate: event.endDate,
            },
            update: { startDate: event.startDate, endDate: event.endDate },
          });
        await tx.externalCalendarEvent.deleteMany({
          where: {
            calendarConnectionId: id,
            externalUid: { notIn: events.map((event) => event.uid) },
          },
        });
        await tx.calendarConnection.update({
          where: { id },
          data: {
            lastSuccessfulSyncAt: this.now(),
            syncStatus: 'SUCCESS',
            errorCode: null,
            syncLeaseOwner: null,
            syncLeaseUntil: null,
          },
        });
      });
      return { status: 'success', importedEventCount: events.length };
    } catch (error) {
      const code =
        error instanceof Error && /^[a-z_]+$/.test(error.message)
          ? error.message.slice(0, 64)
          : 'sync_failed';
      await this.db.calendarConnection.updateMany({
        where: { id, syncLeaseOwner: leaseOwner },
        data: {
          syncStatus: 'FAILED',
          lastErrorAt: this.now(),
          errorCode: code,
          syncLeaseOwner: null,
          syncLeaseUntil: null,
        },
      });
      throw new ApiError(
        502,
        'calendar_sync_failed',
        'Calendar synchronization failed',
      );
    }
  }
  async syncAll() {
    const rows = await this.db.calendarConnection.findMany({
      where: { enabled: true },
      select: { id: true },
    });
    const results = [];
    for (const row of rows) {
      try {
        results.push({ id: row.id, ...(await this.sync(row.id)) });
      } catch {
        results.push({ id: row.id, status: 'failed' });
      }
    }
    return results;
  }
}
