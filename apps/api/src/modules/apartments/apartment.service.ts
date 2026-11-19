import {
  ApartmentStatus,
  Prisma,
  type Apartment,
  type PrismaClient,
} from '@kasvin/database';
import { ApiError } from '../../middleware/error.js';
import type { z } from 'zod';
import type {
  createApartmentSchema,
  updateApartmentSchema,
  statusSchema,
  listPublicSchema,
  listAdminSchema,
  createAmenitySchema,
  updateAmenitySchema,
  createImageSchema,
  updateImageSchema,
} from './apartment.validation.js';

type CreateApartment = z.infer<typeof createApartmentSchema>;
type UpdateApartment = z.infer<typeof updateApartmentSchema>;
type StatusChange = z.infer<typeof statusSchema>;
type PublicFilter = z.infer<typeof listPublicSchema>;
type AdminFilter = z.infer<typeof listAdminSchema>;
type CreateAmenity = z.infer<typeof createAmenitySchema>;
type UpdateAmenity = z.infer<typeof updateAmenitySchema>;
type CreateImage = z.infer<typeof createImageSchema>;
type UpdateImage = z.infer<typeof updateImageSchema>;

const includeRelations = {
  amenities: { include: { amenity: true } },
  images: { orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] },
} satisfies Prisma.ApartmentInclude;
type FullApartment = Prisma.ApartmentGetPayload<{
  include: typeof includeRelations;
}>;

function toPublic(apartment: FullApartment) {
  const images = apartment.images.map(
    ({ id, url, altText, sortOrder, isCover }) => ({
      id,
      url,
      altText,
      sortOrder,
      isCover,
    }),
  );
  return {
    id: apartment.id,
    name: apartment.name,
    slug: apartment.slug,
    shortDescription: apartment.shortDescription,
    description: apartment.description,
    bedrooms: apartment.bedrooms,
    bathrooms: apartment.bathrooms,
    maximumGuests: apartment.maximumGuests,
    locationDescription: apartment.locationDescription,
    unitPosition: apartment.unitPosition,
    baseNightlyRateMinor: apartment.baseNightlyRateMinor,
    currency: apartment.currency,
    coverImage: images.find((image) => image.isCover) ?? null,
    images,
    amenities: apartment.amenities.map(({ amenity }) => ({
      id: amenity.id,
      name: amenity.name,
      slug: amenity.slug,
      category: amenity.category,
    })),
  };
}

function pageResult<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

function withoutUndefined<T>(value: object): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function assertPublishable(
  apartment: Pick<Apartment, 'baseNightlyRateMinor' | 'maximumGuests'>,
): void {
  if (
    apartment.baseNightlyRateMinor === null ||
    apartment.baseNightlyRateMinor <= 0 ||
    apartment.maximumGuests === null
  ) {
    throw new ApiError(
      400,
      'incomplete_listing',
      'A positive nightly rate and maximum guest capacity are required to publish',
    );
  }
}

export class ApartmentService {
  constructor(private readonly db: PrismaClient) {}

  async listPublic(filter: PublicFilter) {
    const where: Prisma.ApartmentWhereInput = {
      status: ApartmentStatus.PUBLISHED,
      ...(filter.bedrooms === undefined ? {} : { bedrooms: filter.bedrooms }),
      ...(filter.maximumGuests === undefined
        ? {}
        : { maximumGuests: { gte: filter.maximumGuests } }),
    };
    const [total, rows] = await Promise.all([
      this.db.apartment.count({ where }),
      this.db.apartment.findMany({
        where,
        include: includeRelations,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
    ]);
    return pageResult(rows.map(toPublic), total, filter.page, filter.pageSize);
  }

  async getPublic(slug: string) {
    const row = await this.db.apartment.findFirst({
      where: { slug, status: ApartmentStatus.PUBLISHED },
      include: includeRelations,
    });
    if (!row) throw new ApiError(404, 'not_found', 'Apartment not found');
    return { data: toPublic(row) };
  }

  async listAdmin(filter: AdminFilter) {
    const where: Prisma.ApartmentWhereInput = {
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.search
        ? {
            OR: [
              { name: { contains: filter.search, mode: 'insensitive' } },
              { code: { contains: filter.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.db.apartment.count({ where }),
      this.db.apartment.findMany({
        where,
        include: includeRelations,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip: (filter.page - 1) * filter.pageSize,
        take: filter.pageSize,
      }),
    ]);
    return pageResult(rows, total, filter.page, filter.pageSize);
  }

  async getAdmin(id: string) {
    const row = await this.db.apartment.findUnique({
      where: { id },
      include: includeRelations,
    });
    if (!row) throw new ApiError(404, 'not_found', 'Apartment not found');
    return { data: row };
  }

  async create(input: CreateApartment) {
    if (input.status === 'PUBLISHED')
      assertPublishable({
        baseNightlyRateMinor: input.baseNightlyRateMinor ?? null,
        maximumGuests: input.maximumGuests ?? null,
      });
    const row = await this.db.apartment.create({
      data: withoutUndefined<Prisma.ApartmentCreateInput>({
        ...input,
        ...(input.status === 'PUBLISHED' ? { publishedAt: new Date() } : {}),
      }),
      include: includeRelations,
    });
    return { data: row };
  }

  private async active(id: string): Promise<Apartment> {
    const row = await this.db.apartment.findUnique({ where: { id } });
    if (!row) throw new ApiError(404, 'not_found', 'Apartment not found');
    if (row.status === ApartmentStatus.ARCHIVED)
      throw new ApiError(
        409,
        'archived',
        'Archived apartments cannot be modified',
      );
    return row;
  }

  async update(id: string, input: UpdateApartment) {
    const current = await this.active(id);
    if (current.status === ApartmentStatus.PUBLISHED)
      assertPublishable({
        baseNightlyRateMinor:
          input.baseNightlyRateMinor === undefined
            ? current.baseNightlyRateMinor
            : input.baseNightlyRateMinor,
        maximumGuests:
          input.maximumGuests === undefined
            ? current.maximumGuests
            : input.maximumGuests,
      });
    const row = await this.db.apartment.update({
      where: { id },
      data: withoutUndefined<Prisma.ApartmentUpdateInput>(input),
      include: includeRelations,
    });
    return { data: row };
  }

  async changeStatus(id: string, input: StatusChange) {
    const current = await this.active(id);
    if (input.status === 'PUBLISHED') assertPublishable(current);
    const row = await this.db.apartment.update({
      where: { id },
      data: {
        status: input.status,
        ...(input.status === 'PUBLISHED' && !current.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
      include: includeRelations,
    });
    return { data: row };
  }

  async archive(id: string) {
    await this.active(id);
    const row = await this.db.apartment.update({
      where: { id },
      data: { status: ApartmentStatus.ARCHIVED, archivedAt: new Date() },
      include: includeRelations,
    });
    return { data: row };
  }

  async listAmenities() {
    return {
      data: await this.db.amenity.findMany({
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
      }),
    };
  }
  async createAmenity(input: CreateAmenity) {
    return {
      data: await this.db.amenity.create({
        data: withoutUndefined<Prisma.AmenityCreateInput>(input),
      }),
    };
  }
  async updateAmenity(id: string, input: UpdateAmenity) {
    return {
      data: await this.db.amenity.update({
        where: { id },
        data: withoutUndefined<Prisma.AmenityUpdateInput>(input),
      }),
    };
  }

  async assignAmenities(id: string, amenityIds: string[]) {
    await this.active(id);
    const existing = await this.db.amenity.count({
      where: { id: { in: amenityIds } },
    });
    if (existing !== amenityIds.length)
      throw new ApiError(
        400,
        'invalid_reference',
        'One or more amenities do not exist',
      );
    await this.db.$transaction(async (tx) => {
      await tx.apartmentAmenity.deleteMany({ where: { apartmentId: id } });
      if (amenityIds.length)
        await tx.apartmentAmenity.createMany({
          data: amenityIds.map((amenityId) => ({ apartmentId: id, amenityId })),
        });
    });
    return this.getAdmin(id);
  }

  async addImage(id: string, input: CreateImage) {
    await this.active(id);
    const row = await this.db.$transaction(async (tx) => {
      if (input.isCover)
        await tx.apartmentImage.updateMany({
          where: { apartmentId: id, isCover: true },
          data: { isCover: false },
        });
      return tx.apartmentImage.create({
        data: withoutUndefined<Prisma.ApartmentImageUncheckedCreateInput>({
          ...input,
          apartmentId: id,
        }),
      });
    });
    return { data: row };
  }

  async updateImage(id: string, imageId: string, input: UpdateImage) {
    await this.active(id);
    const image = await this.db.apartmentImage.findFirst({
      where: { id: imageId, apartmentId: id },
    });
    if (!image) throw new ApiError(404, 'not_found', 'Image not found');
    const row = await this.db.$transaction(async (tx) => {
      if (input.isCover)
        await tx.apartmentImage.updateMany({
          where: { apartmentId: id, isCover: true, id: { not: imageId } },
          data: { isCover: false },
        });
      return tx.apartmentImage.update({
        where: { id: imageId },
        data: withoutUndefined<Prisma.ApartmentImageUpdateInput>(input),
      });
    });
    return { data: row };
  }

  async removeImage(id: string, imageId: string) {
    await this.active(id);
    const result = await this.db.apartmentImage.deleteMany({
      where: { id: imageId, apartmentId: id },
    });
    if (!result.count) throw new ApiError(404, 'not_found', 'Image not found');
    return { data: { deleted: true } };
  }
}
