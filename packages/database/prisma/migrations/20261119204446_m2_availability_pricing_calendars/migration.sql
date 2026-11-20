-- CreateEnum
CREATE TYPE "BlockReason" AS ENUM ('MAINTENANCE', 'OWNER_USE', 'CLEANING', 'OTHER');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('AIRBNB');

-- CreateEnum
CREATE TYPE "CalendarSyncStatus" AS ENUM ('NEVER', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "ManualAvailabilityBlock" (
    "id" UUID NOT NULL,
    "apartmentId" UUID NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "reason" "BlockReason" NOT NULL,
    "notes" TEXT,
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualAvailabilityBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarConnection" (
    "id" UUID NOT NULL,
    "apartmentId" UUID NOT NULL,
    "provider" "CalendarProvider" NOT NULL DEFAULT 'AIRBNB',
    "url" VARCHAR(2048) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastAttemptAt" TIMESTAMP(3),
    "lastSuccessfulSyncAt" TIMESTAMP(3),
    "lastErrorAt" TIMESTAMP(3),
    "syncStatus" "CalendarSyncStatus" NOT NULL DEFAULT 'NEVER',
    "errorCode" VARCHAR(64),
    "syncLeaseUntil" TIMESTAMP(3),
    "syncLeaseOwner" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalCalendarEvent" (
    "id" UUID NOT NULL,
    "calendarConnectionId" UUID NOT NULL,
    "externalUid" VARCHAR(512) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalCalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NightlyRateOverride" (
    "id" UUID NOT NULL,
    "apartmentId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "nightlyRateMinor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NightlyRateOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApartmentPricingSettings" (
    "apartmentId" UUID NOT NULL,
    "minStayNights" INTEGER NOT NULL DEFAULT 1,
    "maxStayNights" INTEGER,
    "advanceNoticeDays" INTEGER,
    "bookingWindowDays" INTEGER,
    "requireExternalSync" BOOLEAN NOT NULL DEFAULT true,
    "freshnessMinutes" INTEGER NOT NULL DEFAULT 240,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApartmentPricingSettings_pkey" PRIMARY KEY ("apartmentId")
);

-- CreateTable
CREATE TABLE "WeekdayRate" (
    "apartmentId" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "nightlyRateMinor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeekdayRate_pkey" PRIMARY KEY ("apartmentId","weekday")
);

-- CreateTable
CREATE TABLE "LengthOfStayDiscount" (
    "apartmentId" UUID NOT NULL,
    "minNights" INTEGER NOT NULL,
    "discountBps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LengthOfStayDiscount_pkey" PRIMARY KEY ("apartmentId","minNights")
);

-- CreateTable
CREATE TABLE "CalendarExportToken" (
    "apartmentId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarExportToken_pkey" PRIMARY KEY ("apartmentId")
);

-- CreateIndex
CREATE INDEX "ManualAvailabilityBlock_apartmentId_startDate_endDate_idx" ON "ManualAvailabilityBlock"("apartmentId", "startDate", "endDate");

-- CreateIndex
CREATE INDEX "CalendarConnection_apartmentId_enabled_idx" ON "CalendarConnection"("apartmentId", "enabled");

-- CreateIndex
CREATE INDEX "CalendarConnection_enabled_syncLeaseUntil_idx" ON "CalendarConnection"("enabled", "syncLeaseUntil");

-- CreateIndex
CREATE INDEX "ExternalCalendarEvent_calendarConnectionId_startDate_endDat_idx" ON "ExternalCalendarEvent"("calendarConnectionId", "startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalCalendarEvent_calendarConnectionId_externalUid_key" ON "ExternalCalendarEvent"("calendarConnectionId", "externalUid");

-- CreateIndex
CREATE UNIQUE INDEX "NightlyRateOverride_apartmentId_date_key" ON "NightlyRateOverride"("apartmentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarExportToken_tokenHash_key" ON "CalendarExportToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "ManualAvailabilityBlock" ADD CONSTRAINT "ManualAvailabilityBlock_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarConnection" ADD CONSTRAINT "CalendarConnection_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalCalendarEvent" ADD CONSTRAINT "ExternalCalendarEvent_calendarConnectionId_fkey" FOREIGN KEY ("calendarConnectionId") REFERENCES "CalendarConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightlyRateOverride" ADD CONSTRAINT "NightlyRateOverride_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApartmentPricingSettings" ADD CONSTRAINT "ApartmentPricingSettings_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeekdayRate" ADD CONSTRAINT "WeekdayRate_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LengthOfStayDiscount" ADD CONSTRAINT "LengthOfStayDiscount_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarExportToken" ADD CONSTRAINT "CalendarExportToken_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Database invariants protect every writer, including future booking services.
ALTER TABLE "ManualAvailabilityBlock" ADD CONSTRAINT "manual_block_interval" CHECK ("startDate" < "endDate");
ALTER TABLE "ExternalCalendarEvent" ADD CONSTRAINT "external_event_interval" CHECK ("startDate" < "endDate");
ALTER TABLE "NightlyRateOverride" ADD CONSTRAINT "rate_override_positive" CHECK ("nightlyRateMinor" > 0);
ALTER TABLE "WeekdayRate" ADD CONSTRAINT "weekday_rate_valid" CHECK ("weekday" BETWEEN 0 AND 6 AND "nightlyRateMinor" > 0);
ALTER TABLE "LengthOfStayDiscount" ADD CONSTRAINT "stay_discount_valid" CHECK ("minNights" >= 1 AND "discountBps" BETWEEN 1 AND 9999);
ALTER TABLE "ApartmentPricingSettings" ADD CONSTRAINT "pricing_settings_valid" CHECK ("minStayNights" >= 1 AND ("maxStayNights" IS NULL OR "maxStayNights" >= "minStayNights") AND ("advanceNoticeDays" IS NULL OR "advanceNoticeDays" >= 0) AND ("bookingWindowDays" IS NULL OR "bookingWindowDays" >= 1) AND "freshnessMinutes" BETWEEN 1 AND 10080);
