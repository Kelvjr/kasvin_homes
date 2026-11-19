# Apartments API — M1 frontend contract

Base URL in local development: `http://localhost:4000/api/v1`. All responses are JSON. Apartment IDs are permanent UUIDs; public routes use the editable slug. Names and slugs may change, while codes are immutable after creation. There are no booking or availability endpoints in M1.

## Public reads

| Method | Path                | Purpose                       |
| ------ | ------------------- | ----------------------------- |
| GET    | `/apartments`       | Published apartment summaries |
| GET    | `/apartments/:slug` | Published apartment details   |

`GET /apartments` accepts `page` (default 1), `pageSize` (default 20, maximum 100), `bedrooms` (nonnegative integer), and `maximumGuests` (positive integer minimum capacity). Filtering by capacity means `maximumGuests >= requested value`. Results sort by creation time, then ID. Both public routes exclude `DRAFT`, `UNAVAILABLE`, and `ARCHIVED`. A hidden or unknown slug returns 404.

At M1 seed state, the public response is:

```json
{
  "data": [],
  "pagination": { "page": 1, "pageSize": 20, "total": 0, "totalPages": 0 }
}
```

Once an apartment has a confirmed positive base rate and maximum guest capacity, an administrator may publish it. A public item contains `id`, `name`, `slug`, `shortDescription`, `description`, `bedrooms`, `bathrooms`, `maximumGuests`, `locationDescription`, `unitPosition`, `baseNightlyRateMinor`, `currency`, `coverImage`, `images`, and `amenities`. The detail endpoint returns `{ "data": item }` with the same fields. It excludes internal `code`, timestamps, status, and Cloudinary `publicId`.

`baseNightlyRateMinor` is an **integer in pesewas**, or `null` on unpublished administrative records. For example, GH₵500.00 would be stored as `50000`; this is a unit example, not a Kasvin Homes rate. Currency defaults to `GHS`. Do not interpret this base rate as a reservation quote; M2 will add date-based pricing.

`images` are ordered by `sortOrder` ascending, then image ID. Each public image has `id`, HTTPS `url`, nullable `altText`, `sortOrder`, and `isCover`. `coverImage` is one of those objects or `null`. No image records exist for the seeded apartments. Each public amenity has `id`, `name`, `slug`, and nullable `category`. No amenities are assigned by the seed.

## Administrative routes

All routes below begin with `/admin` and require the `Authorization: Bearer <token>` header **only in nonproduction development or test environments** with `DEV_ADMIN_TOKEN` explicitly configured. Tokens must have at least 32 characters. Production admin routes always return 401 until Clerk authorization is implemented. Do not put this token in browser code or a `NEXT_PUBLIC_` variable. A client-provided role header has no effect.

| Method | Path                                    | Body / query                                            | Result                                |
| ------ | --------------------------------------- | ------------------------------------------------------- | ------------------------------------- |
| GET    | `/admin/apartments`                     | `page`, `pageSize`, optional `status`, `search`         | 200 paginated records                 |
| GET    | `/admin/apartments/:id`                 | UUID ID                                                 | 200 record                            |
| POST   | `/admin/apartments`                     | Apartment creation fields                               | 201 record                            |
| PATCH  | `/admin/apartments/:id`                 | Partial apartment fields                                | 200 record                            |
| PATCH  | `/admin/apartments/:id/status`          | `{ "status": "DRAFT" \| "PUBLISHED" \| "UNAVAILABLE" }` | 200 record                            |
| DELETE | `/admin/apartments/:id`                 | None                                                    | 200 archived record                   |
| GET    | `/admin/amenities`                      | None                                                    | 200 list                              |
| POST   | `/admin/amenities`                      | `name`, `slug`, optional `category`, `description`      | 201 record                            |
| PATCH  | `/admin/amenities/:id`                  | Partial amenity fields                                  | 200 record                            |
| PUT    | `/admin/apartments/:id/amenities`       | `{ "amenityIds": ["UUID", ...] }`                       | 200 apartment                         |
| POST   | `/admin/apartments/:id/images`          | Image metadata                                          | 201 image                             |
| PATCH  | `/admin/apartments/:id/images/:imageId` | Partial image metadata                                  | 200 image                             |
| DELETE | `/admin/apartments/:id/images/:imageId` | None                                                    | 200 `{ "data": { "deleted": true } }` |

Admin apartment lists sort by creation time, then ID. `status` is one of `DRAFT`, `PUBLISHED`, `UNAVAILABLE`, `ARCHIVED`; `search` matches name or code without case sensitivity. Pagination uses the public response envelope. Admin apartment records include all persisted fields, ordered `images`, and `amenities` relation entries. `DELETE` archives; it never removes the permanent ID. Archived apartments can be read by admin but cannot be modified. `code` is immutable after creation. Amenity assignment replaces the full set; passing an empty array removes assignments while preserving shared Amenity records.

Apartment creation requires `code` (uppercase letters, digits, underscores), `name`, lowercase hyphenated `slug`, and nonnegative integer `bedrooms`. Optional fields are `bathrooms` (nonnegative integer or null), `maximumGuests` (positive integer or null), `baseNightlyRateMinor` (nonnegative integer or null), `currency` (three uppercase letters, default `GHS`), descriptions, location, unit position, and initial status. Creation cannot use `ARCHIVED`. Update accepts any nonempty subset except code and status. Published apartments require a **positive** base rate and maximum guest capacity; those values cannot be cleared while published. Status changes use the dedicated route. Archive is terminal.

Image creation requires an HTTPS `url`; optional fields are nullable `publicId`, nullable `altText`, nonnegative integer `sortOrder` (default 0), and boolean `isCover` (default false). Image PATCH can update those fields and reorder. Assigning a new cover clears the prior cover in a transaction. A database unique index permits at most one cover per apartment. Duplicate image URLs within one apartment are rejected. M1 stores references only; it does not upload images.

The seed creates the four official apartments in `DRAFT`. For example, an authorized `GET /admin/apartments?search=SIRIUS` returns a paginated `data` array with a record shaped like:

```json
{
  "id": "<permanent UUID>",
  "code": "SIRIUS",
  "name": "The Sirius Residence",
  "slug": "the-sirius-residence",
  "bedrooms": 2,
  "bathrooms": null,
  "maximumGuests": null,
  "baseNightlyRateMinor": null,
  "currency": "GHS",
  "locationDescription": "Middle floor",
  "status": "DRAFT",
  "images": [],
  "amenities": []
}
```

The actual admin record also has nullable descriptions, `unitPosition`, `publishedAt`, `archivedAt`, `createdAt`, and `updatedAt`.

## Errors and limits

Errors use `{ "error": "code", "message": "safe text" }`. Common statuses: 400 invalid input or incomplete publication; 401 missing, invalid, or disabled admin access; 404 absent or hidden apartment, amenity, or image; 409 duplicate code, slug, name, image, or archived modification; 500 unexpected server error. Malformed JSON returns 400. Prisma messages and connection strings are never returned to clients.

The public site can call read routes without authentication. Admin UI must wait for the planned Clerk integration; the development token must never be shipped to a browser. No dates, availability, booking, payment, or Cloudinary upload behavior exists in M1.
