# Architecture overview

The public website (`apps/web`) and admin dashboard (`apps/dashboard`) are separate Next.js applications. Browser requests from each will call the versioned REST API at its configured public URL. The API owns business rules and database access. Its CORS allowlist must include the deployed site origins. The dashboard currently shows only a static placeholder; authentication and authorization will be added before administrative information is exposed.

A future Flutter Android owner app will call the same REST API using mobile authentication. It is not in the pnpm workspace.

PostgreSQL is the system of record. `packages/database` holds Prisma configuration, the apartment schema and migration, generated client setup, and a reusable connection utility. The API readiness endpoint runs a real `SELECT 1` against PostgreSQL. Health reports process liveness without requiring database access.

M1 adds Apartment, Amenity, ApartmentAmenity, and ApartmentImage models. Apartment IDs are stable UUIDs; public names and slugs can change. The API apartment module owns publication checks, filtering, metadata management, and soft archiving. PostgreSQL enforces numeric checks, relationships, unique identifiers, and one cover image per apartment. The public API exposes only published apartments. Administrative routes are closed in production until Clerk authorization is implemented; an explicitly configured development token supports local backend testing. See [the apartment API contract](../api/apartments.md).

Future payment, identity, email, image upload, notification, calendar, queue, and monitoring integrations belong behind API modules or appropriately isolated application adapters. They are absent from M1. Browser bundles must never contain private credentials.

The website and dashboard deploy as independent Vercel projects. The API deploys separately to Railway, with its own environment and PostgreSQL connection. This separation allows independent builds and domains while keeping one central backend.
