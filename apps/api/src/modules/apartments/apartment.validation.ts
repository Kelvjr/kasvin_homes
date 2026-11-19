import { z } from 'zod';
import { ApiError } from '../../middleware/error.js';

const name = z.string().trim().min(1).max(160);
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(180);
const code = z
  .string()
  .regex(/^[A-Z][A-Z0-9_]*$/)
  .max(32);
const nullableText = (max: number) =>
  z.string().trim().min(1).max(max).nullable().optional();
const nullableCount = (minimum: number) =>
  z.number().int().min(minimum).nullable().optional();

export const createApartmentSchema = z.strictObject({
  code,
  name,
  slug,
  bedrooms: z.number().int().min(0),
  bathrooms: nullableCount(0),
  maximumGuests: nullableCount(1),
  baseNightlyRateMinor: nullableCount(0),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .optional(),
  shortDescription: nullableText(500),
  description: nullableText(10_000),
  locationDescription: nullableText(160),
  unitPosition: nullableText(160),
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE']).optional(),
});

export const updateApartmentSchema = createApartmentSchema
  .omit({ code: true, status: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0);
export const statusSchema = z.strictObject({
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE']),
});
export const listPublicSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  bedrooms: z.coerce.number().int().min(0).optional(),
  maximumGuests: z.coerce.number().int().min(1).optional(),
});
export const listAdminSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'ARCHIVED']).optional(),
  search: z.string().trim().min(1).max(100).optional(),
});
export const createAmenitySchema = z.strictObject({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(140),
  category: nullableText(100),
  description: nullableText(1000),
});
export const updateAmenitySchema = createAmenitySchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);
export const assignAmenitiesSchema = z.strictObject({
  amenityIds: z
    .array(z.uuid())
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length, 'Duplicate amenity IDs'),
});
export const createImageSchema = z.strictObject({
  url: z
    .url()
    .refine((value) => value.startsWith('https://'), 'HTTPS URL required')
    .max(2048),
  publicId: nullableText(255),
  altText: nullableText(300),
  sortOrder: z.number().int().min(0).default(0),
  isCover: z.boolean().default(false),
});
export const updateImageSchema = createImageSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0);

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success)
    throw new ApiError(400, 'invalid_input', 'Invalid request input');
  return result.data;
}

export function parseId(input: unknown): string {
  return parseInput(z.uuid(), input);
}
export function parseSlug(input: unknown): string {
  return parseInput(slug, input);
}
