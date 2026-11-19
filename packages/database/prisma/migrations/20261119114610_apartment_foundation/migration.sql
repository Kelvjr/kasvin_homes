-- CreateEnum
CREATE TYPE "ApartmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "Apartment" (
    "id" UUID NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "shortDescription" VARCHAR(500),
    "description" TEXT,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER,
    "maximumGuests" INTEGER,
    "locationDescription" VARCHAR(160),
    "unitPosition" VARCHAR(160),
    "baseNightlyRateMinor" INTEGER,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'GHS',
    "status" "ApartmentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Apartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "category" VARCHAR(100),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApartmentAmenity" (
    "apartmentId" UUID NOT NULL,
    "amenityId" UUID NOT NULL,

    CONSTRAINT "ApartmentAmenity_pkey" PRIMARY KEY ("apartmentId","amenityId")
);

-- CreateTable
CREATE TABLE "ApartmentImage" (
    "id" UUID NOT NULL,
    "apartmentId" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "publicId" VARCHAR(255),
    "altText" VARCHAR(300),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApartmentImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Apartment_code_key" ON "Apartment"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Apartment_slug_key" ON "Apartment"("slug");

-- CreateIndex
CREATE INDEX "Apartment_status_createdAt_id_idx" ON "Apartment"("status", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Apartment_bedrooms_maximumGuests_idx" ON "Apartment"("bedrooms", "maximumGuests");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_slug_key" ON "Amenity"("slug");

-- CreateIndex
CREATE INDEX "ApartmentAmenity_amenityId_idx" ON "ApartmentAmenity"("amenityId");

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentImage_publicId_key" ON "ApartmentImage"("publicId");

-- CreateIndex
CREATE INDEX "ApartmentImage_apartmentId_sortOrder_id_idx" ON "ApartmentImage"("apartmentId", "sortOrder", "id");

-- CreateIndex
CREATE UNIQUE INDEX "ApartmentImage_apartmentId_url_key" ON "ApartmentImage"("apartmentId", "url");

-- Integrity rules Prisma Schema Language cannot express.
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_bedrooms_nonnegative" CHECK ("bedrooms" >= 0);
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_bathrooms_nonnegative" CHECK ("bathrooms" IS NULL OR "bathrooms" >= 0);
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_maximumGuests_positive" CHECK ("maximumGuests" IS NULL OR "maximumGuests" > 0);
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_rate_nonnegative" CHECK ("baseNightlyRateMinor" IS NULL OR "baseNightlyRateMinor" >= 0);
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_currency_code" CHECK ("currency" ~ '^[A-Z]{3}$');
ALTER TABLE "Apartment" ADD CONSTRAINT "Apartment_published_complete" CHECK ("status" <> 'PUBLISHED' OR ("baseNightlyRateMinor" IS NOT NULL AND "baseNightlyRateMinor" > 0 AND "maximumGuests" IS NOT NULL AND "maximumGuests" > 0));
ALTER TABLE "ApartmentImage" ADD CONSTRAINT "ApartmentImage_sortOrder_nonnegative" CHECK ("sortOrder" >= 0);
CREATE UNIQUE INDEX "ApartmentImage_one_cover_per_apartment" ON "ApartmentImage"("apartmentId") WHERE "isCover" = true;

-- AddForeignKey
ALTER TABLE "ApartmentAmenity" ADD CONSTRAINT "ApartmentAmenity_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartmentAmenity" ADD CONSTRAINT "ApartmentAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartmentImage" ADD CONSTRAINT "ApartmentImage_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
