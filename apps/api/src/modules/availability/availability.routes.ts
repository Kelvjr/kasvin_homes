import { Router } from 'express';
import { z } from 'zod';
import type { AppConfig } from '../../config/env.js';
import { requireAdmin } from '../../middleware/admin.js';
import { ApiError } from '../../middleware/error.js';
import { AvailabilityService } from './availability.service.js';
import { CalendarSyncService } from './calendar.sync.js';

const id = z.uuid();
const date = z.iso.date();
const integer = z.number().int();
const positive = integer.positive();
const guests = positive.max(50);
const stay = z.object({ checkIn: date, checkOut: date, guests });
const block = z.object({
  startDate: date,
  endDate: date,
  reason: z.enum(['MAINTENANCE', 'OWNER_USE', 'CLEANING', 'OTHER']),
  notes: z.string().max(2000).optional(),
});
const settings = z.object({
  baseNightlyRateMinor: positive.nullable().optional(),
  minStayNights: positive.max(366).optional(),
  maxStayNights: positive.max(366).nullable().optional(),
  advanceNoticeDays: integer.min(0).max(365).nullable().optional(),
  bookingWindowDays: positive.max(730).nullable().optional(),
  requireExternalSync: z.boolean().optional(),
  freshnessMinutes: positive.max(10080).optional(),
});
function read<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success)
    throw new ApiError(400, 'invalid_input', 'Invalid request input');
  return parsed.data;
}
function param(value: string | string[] | undefined): string {
  return read(id, value);
}

export function availabilityRoutes(
  config: AppConfig,
  service: AvailabilityService,
  sync: CalendarSyncService,
): Router {
  const router = Router();
  const admin = Router();
  router.get('/availability', async (req, res) => {
    const query = read(
      z.object({
        checkIn: date,
        checkOut: date,
        guests: z.coerce.number().int().min(1).max(50),
      }),
      req.query,
    );
    res.json(await service.search(query.checkIn, query.checkOut, query.guests));
  });
  router.get('/apartments/:slug/availability', async (req, res) => {
    const query = read(z.object({ startDate: date, endDate: date }), req.query);
    res.json(
      await service.publicCalendar(
        String(req.params.slug),
        query.startDate,
        query.endDate,
      ),
    );
  });
  router.post('/quotes', async (req, res) => {
    const input = read(stay.extend({ apartmentId: id }), req.body);
    res.json(
      await service.quote(
        input.apartmentId,
        input.checkIn,
        input.checkOut,
        input.guests,
      ),
    );
  });
  router.get('/calendars/export/:token.ics', async (req, res) => {
    const token = read(
      z.string().regex(/^[A-Za-z0-9_-]{43}$/),
      req.params.token,
    );
    res
      .set('Cache-Control', 'no-store')
      .type('text/calendar')
      .send(await service.exportCalendar(token));
  });

  admin.get('/apartments/:id/availability', async (req, res) => {
    const query = read(z.object({ startDate: date, endDate: date }), req.query);
    res.json(
      await service.calendar(
        param(req.params.id),
        query.startDate,
        query.endDate,
        true,
      ),
    );
  });
  admin.get('/apartments/:id/blocks', async (req, res) =>
    res.json(await service.listBlocks(param(req.params.id))),
  );
  admin.post('/apartments/:id/blocks', async (req, res) =>
    res
      .status(201)
      .json(
        await service.createBlock(param(req.params.id), read(block, req.body)),
      ),
  );
  admin.patch('/apartments/:id/blocks/:blockId', async (req, res) =>
    res.json(
      await service.updateBlock(
        param(req.params.id),
        param(req.params.blockId),
        read(
          block
            .partial()
            .extend({ notes: z.string().max(2000).nullable().optional() }),
          req.body,
        ),
      ),
    ),
  );
  admin.delete('/apartments/:id/blocks/:blockId', async (req, res) =>
    res.json(
      await service.removeBlock(
        param(req.params.id),
        param(req.params.blockId),
      ),
    ),
  );
  admin.get('/apartments/:id/pricing', async (req, res) =>
    res.json(await service.pricing(param(req.params.id))),
  );
  admin.patch('/apartments/:id/pricing', async (req, res) =>
    res.json(
      await service.updatePricing(
        param(req.params.id),
        read(settings, req.body),
      ),
    ),
  );
  admin.put('/apartments/:id/pricing/overrides/:date', async (req, res) =>
    res.json(
      await service.setOverride(
        param(req.params.id),
        read(date, req.params.date),
        read(z.object({ nightlyRateMinor: positive }), req.body)
          .nightlyRateMinor,
      ),
    ),
  );
  admin.delete('/apartments/:id/pricing/overrides/:date', async (req, res) =>
    res.json(
      await service.removeOverride(
        param(req.params.id),
        read(date, req.params.date),
      ),
    ),
  );
  admin.put('/apartments/:id/pricing/weekdays/:weekday', async (req, res) =>
    res.json(
      await service.setWeekday(
        param(req.params.id),
        read(z.coerce.number().int().min(0).max(6), req.params.weekday),
        read(z.object({ nightlyRateMinor: positive }), req.body)
          .nightlyRateMinor,
      ),
    ),
  );
  admin.delete('/apartments/:id/pricing/weekdays/:weekday', async (req, res) =>
    res.json(
      await service.removeWeekday(
        param(req.params.id),
        read(z.coerce.number().int().min(0).max(6), req.params.weekday),
      ),
    ),
  );
  admin.put('/apartments/:id/pricing/discounts/:minNights', async (req, res) =>
    res.json(
      await service.setDiscount(
        param(req.params.id),
        read(z.coerce.number().int().min(1).max(366), req.params.minNights),
        read(z.object({ discountBps: integer.min(1).max(3000) }), req.body)
          .discountBps,
      ),
    ),
  );
  admin.delete(
    '/apartments/:id/pricing/discounts/:minNights',
    async (req, res) =>
      res.json(
        await service.removeDiscount(
          param(req.params.id),
          read(z.coerce.number().int().min(1).max(366), req.params.minNights),
        ),
      ),
  );
  admin.post('/apartments/:id/quote-preview', async (req, res) => {
    const input = read(stay, req.body);
    res.json(
      await service.quote(
        param(req.params.id),
        input.checkIn,
        input.checkOut,
        input.guests,
        true,
      ),
    );
  });
  admin.get('/apartments/:id/calendar-connections', async (req, res) =>
    res.json(await sync.list(param(req.params.id))),
  );
  admin.post('/apartments/:id/calendar-connections', async (req, res) =>
    res
      .status(201)
      .json(
        await sync.create(
          param(req.params.id),
          read(z.object({ url: z.url() }), req.body).url,
        ),
      ),
  );
  admin.patch(
    '/apartments/:id/calendar-connections/:connectionId',
    async (req, res) =>
      res.json(
        await sync.update(
          param(req.params.id),
          param(req.params.connectionId),
          read(
            z.object({
              enabled: z.boolean().optional(),
              url: z.url().optional(),
            }),
            req.body,
          ),
        ),
      ),
  );
  admin.delete(
    '/apartments/:id/calendar-connections/:connectionId',
    async (req, res) =>
      res.json(
        await sync.remove(param(req.params.id), param(req.params.connectionId)),
      ),
  );
  admin.post(
    '/apartments/:id/calendar-connections/:connectionId/sync',
    async (req, res) =>
      res.json(
        await sync.sync(param(req.params.connectionId), param(req.params.id)),
      ),
  );
  admin.post('/apartments/:id/export-token', async (req, res) =>
    res.status(201).json(await service.rotateToken(param(req.params.id))),
  );
  admin.delete('/apartments/:id/export-token', async (req, res) =>
    res.json(await service.revokeToken(param(req.params.id))),
  );
  router.use('/admin', requireAdmin(config), admin);
  return router;
}
