import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { closeDatabaseConnection, getDatabaseClient } from '@kasvin/database';
import {
  initialApartments,
  seedApartments,
} from '../../../../packages/database/prisma/seed.js';
import { createApp } from '../app.js';
import { parseConfig } from '../config/env.js';
import { ApartmentService } from '../modules/apartments/apartment.service.js';

const url = process.env.M1_TEST_DATABASE_URL;
const testUrl = url ?? 'postgresql://localhost:5432/kasvin_m1_test';
const token = 'm1_integration_test_token_0123456789abcdef';

describe.skipIf(!url)('M1 PostgreSQL integration', () => {
  if (
    url &&
    (new URL(url).hostname !== '127.0.0.1' ||
      !new URL(url).pathname.endsWith('_test'))
  ) {
    throw new Error(
      'M1_TEST_DATABASE_URL must point to a disposable local *_test database',
    );
  }
  const db = getDatabaseClient(testUrl);
  const config = parseConfig({
    NODE_ENV: 'test',
    DATABASE_URL: testUrl,
    CORS_ORIGINS: 'http://localhost:3000',
    DEV_ADMIN_TOKEN: token,
  });
  const app = createApp(
    config,
    async () => {
      await db.$queryRaw`SELECT 1`;
    },
    new ApartmentService(db),
  );
  const admin = (
    method: 'get' | 'post' | 'patch' | 'put' | 'delete',
    path: string,
  ) =>
    request(app)
      [method](`/api/v1/admin${path}`)
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    await seedApartments(db);
  });
  afterAll(async () => {
    await closeDatabaseConnection();
  });

  it('seeds exactly four official drafts and preserves edits on repeat', async () => {
    const records = await db.apartment.findMany({
      where: { code: { in: initialApartments.map((entry) => entry.code) } },
      orderBy: { code: 'asc' },
    });
    expect(records).toHaveLength(4);
    for (const expected of initialApartments) {
      const actual = records.find((entry) => entry.code === expected.code);
      expect(actual).toMatchObject({
        ...expected,
        status: 'DRAFT',
        baseNightlyRateMinor: null,
        maximumGuests: null,
        bathrooms: null,
      });
    }
    const sirius = records.find((entry) => entry.code === 'SIRIUS')!;
    await db.apartment.update({
      where: { id: sirius.id },
      data: { name: 'Edited name' },
    });
    await seedApartments(db);
    expect(
      await db.apartment.count({
        where: { code: { in: initialApartments.map((entry) => entry.code) } },
      }),
    ).toBe(4);
    expect(
      (await db.apartment.findUniqueOrThrow({ where: { id: sirius.id } })).name,
    ).toBe('Edited name');
    await db.apartment.update({
      where: { id: sirius.id },
      data: { name: sirius.name },
    });
  });

  it('hides all drafts from public routes and requires admin authorization', async () => {
    const list = await request(app).get('/api/v1/apartments');
    expect(list.status).toBe(200);
    expect(list.body).toMatchObject({
      data: [],
      pagination: { total: 0, page: 1 },
    });
    expect(
      (await request(app).get('/api/v1/apartments/the-sirius-residence'))
        .status,
    ).toBe(404);
    expect((await request(app).get('/api/v1/admin/apartments')).status).toBe(
      401,
    );
    expect(
      (
        await request(app)
          .get('/api/v1/admin/apartments')
          .set('x-role', 'admin')
      ).status,
    ).toBe(401);
    expect(
      (await request(app).post('/api/v1/admin/apartments').send({})).status,
    ).toBe(401);
  });

  it('lists, searches, and paginates administrative records', async () => {
    const list = await admin(
      'get',
      '/apartments?status=DRAFT&page=1&pageSize=2',
    );
    expect(list.status).toBe(200);
    expect(list.body.pagination).toMatchObject({
      total: 4,
      page: 1,
      pageSize: 2,
      totalPages: 2,
    });
    const search = await admin('get', '/apartments?search=SIRIUS');
    expect(search.body.data).toHaveLength(1);
    expect(search.body.data[0].code).toBe('SIRIUS');
    expect((await admin('get', '/apartments?page=0')).status).toBe(400);
    expect((await admin('get', '/apartments/not-a-uuid')).status).toBe(400);
  });

  it('creates, updates, publishes, filters, and archives an apartment', async () => {
    const suffix = Date.now().toString();
    const input = {
      code: `TEST_${suffix}`,
      name: 'Temporary test apartment',
      slug: `temporary-test-${suffix}`,
      bedrooms: 1,
    };
    const created = await admin('post', '/apartments').send(input);
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;
    expect((await admin('post', '/apartments').send(input)).status).toBe(409);
    expect(
      (
        await admin('patch', `/apartments/${id}/status`).send({
          status: 'PUBLISHED',
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await admin('patch', `/apartments/${id}`).send({
          maximumGuests: 2,
          baseNightlyRateMinor: 0,
        })
      ).status,
    ).toBe(200);
    expect(
      (
        await admin('patch', `/apartments/${id}/status`).send({
          status: 'PUBLISHED',
        })
      ).status,
    ).toBe(400);
    const update = await admin('patch', `/apartments/${id}`).send({
      name: 'Updated test apartment',
      maximumGuests: 2,
      baseNightlyRateMinor: 50000,
    });
    expect(update.status).toBe(200);
    expect(update.body.data.code).toBe(input.code);
    expect(
      (
        await admin('patch', `/apartments/${id}/status`).send({
          status: 'PUBLISHED',
        })
      ).status,
    ).toBe(200);
    const publicList = await request(app).get(
      '/api/v1/apartments?bedrooms=1&maximumGuests=2&pageSize=1',
    );
    expect(publicList.body.pagination.total).toBe(1);
    expect(publicList.body.data[0]).toMatchObject({
      id,
      name: 'Updated test apartment',
      baseNightlyRateMinor: 50000,
      currency: 'GHS',
    });
    expect(publicList.body.data[0]).not.toHaveProperty('code');
    expect(publicList.body.data[0]).not.toHaveProperty('archivedAt');
    expect(
      (await request(app).get(`/api/v1/apartments/${input.slug}`)).status,
    ).toBe(200);
    expect(
      (await request(app).get('/api/v1/apartments?maximumGuests=3')).body.data,
    ).toHaveLength(0);
    expect(
      (
        await admin('patch', `/apartments/${id}`).send({
          baseNightlyRateMinor: null,
        })
      ).status,
    ).toBe(400);
    expect((await admin('delete', `/apartments/${id}`)).body.data.status).toBe(
      'ARCHIVED',
    );
    expect(
      (await request(app).get(`/api/v1/apartments/${input.slug}`)).status,
    ).toBe(404);
    expect(
      (await admin('patch', `/apartments/${id}`).send({ name: 'No' })).status,
    ).toBe(409);
  });

  it('assigns amenities and manages ordered images with one cover', async () => {
    const apartment = await db.apartment.findUniqueOrThrow({
      where: { code: 'EOS' },
    });
    const amenity = await admin('post', '/amenities').send({
      name: 'Test amenity',
      slug: `test-amenity-${Date.now()}`,
    });
    expect(amenity.status).toBe(201);
    const amenityId = amenity.body.data.id as string;
    expect(
      (
        await admin('put', `/apartments/${apartment.id}/amenities`).send({
          amenityIds: [amenityId, amenityId],
        })
      ).status,
    ).toBe(400);
    const assigned = await admin(
      'put',
      `/apartments/${apartment.id}/amenities`,
    ).send({ amenityIds: [amenityId] });
    expect(assigned.body.data.amenities).toHaveLength(1);
    expect(
      (
        await admin('put', `/apartments/${apartment.id}/amenities`).send({
          amenityIds: [],
        })
      ).body.data.amenities,
    ).toHaveLength(0);
    expect(
      await db.amenity.findUnique({ where: { id: amenityId } }),
    ).not.toBeNull();

    const first = await admin(
      'post',
      `/apartments/${apartment.id}/images`,
    ).send({
      url: 'https://example.com/test-one.jpg',
      sortOrder: 2,
      isCover: true,
    });
    expect(first.status).toBe(201);
    const second = await admin(
      'post',
      `/apartments/${apartment.id}/images`,
    ).send({
      url: 'https://example.com/test-two.jpg',
      sortOrder: 1,
      isCover: true,
    });
    expect(second.status).toBe(201);
    expect(
      (
        await admin('post', `/apartments/${apartment.id}/images`).send({
          url: 'http://example.com/unsafe.jpg',
        })
      ).status,
    ).toBe(400);
    const detail = await admin('get', `/apartments/${apartment.id}`);
    expect(
      detail.body.data.images.map((image: { id: string }) => image.id),
    ).toEqual([second.body.data.id, first.body.data.id]);
    expect(
      detail.body.data.images.filter(
        (image: { isCover: boolean }) => image.isCover,
      ),
    ).toHaveLength(1);
    expect(
      (
        await admin(
          'patch',
          `/apartments/${apartment.id}/images/${first.body.data.id}`,
        ).send({ sortOrder: 0, altText: 'Test image' })
      ).status,
    ).toBe(200);
    expect(
      (
        await admin(
          'delete',
          `/apartments/${apartment.id}/images/${second.body.data.id}`,
        )
      ).status,
    ).toBe(200);
  });

  it('enforces numeric and cover constraints in PostgreSQL', async () => {
    await expect(
      db.apartment.create({
        data: {
          code: `BAD_${Date.now()}`,
          name: 'Bad',
          slug: `bad-${Date.now()}`,
          bedrooms: -1,
        },
      }),
    ).rejects.toThrow();
    await expect(
      db.apartment.create({
        data: {
          code: `INCOMPLETE_${Date.now()}`,
          name: 'Incomplete',
          slug: `incomplete-${Date.now()}`,
          bedrooms: 1,
          status: 'PUBLISHED',
        },
      }),
    ).rejects.toThrow();
    const apartment = await db.apartment.findUniqueOrThrow({
      where: { code: 'EOS' },
    });
    await expect(
      db.apartmentAmenity.create({
        data: {
          apartmentId: apartment.id,
          amenityId: '00000000-0000-4000-8000-000000000001',
        },
      }),
    ).rejects.toThrow();
    const currentCover = await db.apartmentImage.findFirst({
      where: { apartmentId: apartment.id, isCover: true },
    });
    if (currentCover)
      await expect(
        db.apartmentImage.create({
          data: {
            apartmentId: apartment.id,
            url: 'https://example.com/third-cover.jpg',
            isCover: true,
          },
        }),
      ).rejects.toThrow();
  });
});
