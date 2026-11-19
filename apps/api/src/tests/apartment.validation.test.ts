import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { parseConfig } from '../config/env.js';
import { requireAdmin } from '../middleware/admin.js';
import {
  createApartmentSchema,
  createImageSchema,
  listPublicSchema,
  parseInput,
} from '../modules/apartments/apartment.validation.js';
import express from 'express';

describe('M1 validation and admin boundary', () => {
  it('rejects negative counts, prices, and malformed pagination', () => {
    const base = {
      code: 'TEST',
      name: 'Test apartment',
      slug: 'test-apartment',
      bedrooms: 1,
    };
    expect(
      createApartmentSchema.safeParse({ ...base, bedrooms: -1 }).success,
    ).toBe(false);
    expect(
      createApartmentSchema.safeParse({ ...base, maximumGuests: 0 }).success,
    ).toBe(false);
    expect(
      createApartmentSchema.safeParse({ ...base, baseNightlyRateMinor: -1 })
        .success,
    ).toBe(false);
    expect(() => parseInput(listPublicSchema, { page: '0' })).toThrow();
  });

  it('requires HTTPS image references', () => {
    expect(
      createImageSchema.safeParse({ url: 'http://example.com/image.jpg' })
        .success,
    ).toBe(false);
    expect(
      createImageSchema.safeParse({ url: 'https://example.com/image.jpg' })
        .success,
    ).toBe(true);
  });

  it('fails closed without a token and in production even with a configured token', async () => {
    const app = express();
    const config = parseConfig({
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://localhost:5432/test',
      CORS_ORIGINS: 'http://localhost:3000',
      DEV_ADMIN_TOKEN: 'a'.repeat(64),
    });
    app.get('/admin', requireAdmin(config), (_req, res) => {
      res.json({ ok: true });
    });
    expect(
      (
        await request(app)
          .get('/admin')
          .set('Authorization', `Bearer ${'a'.repeat(64)}`)
      ).status,
    ).toBe(401);
    expect(
      (await request(createApp(config, async () => {})).get('/api/v1/health'))
        .status,
    ).toBe(200);
  });
});
