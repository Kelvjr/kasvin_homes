# Availability API (M2)

All dates are `YYYY-MM-DD` civil dates in `Africa/Accra`. A stay occupies `[checkIn, checkOut)`; checkout is free for another arrival. The API rejects invalid dates, past check-in, zero or negative stays, and searches over 366 nights. Quotes are limited to 90 nights. Guest counts are 1–50. Availability uses stored data and never fetches an external feed during a public request.

## Public

| Method | Path                                    | Input                                      | Result                                                                              |
| ------ | --------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------- |
| GET    | `/api/v1/availability`                  | `checkIn`, `checkOut`, `guests` query      | Published apartments within capacity, with `available` and a generic `reason` code. |
| GET    | `/api/v1/apartments/:slug/availability` | `startDate`, `endDate` query               | One `days` entry per occupied night with `date` and `available`.                    |
| POST   | `/api/v1/quotes`                        | `{apartmentId, checkIn, checkOut, guests}` | Nonbinding accommodation quote if the whole stay is available.                      |
| GET    | `/api/v1/calendars/export/:token.ics`   | Secret token URL                           | `text/calendar` feed of current manual blocks.                                      |

Reason codes include `listing_unavailable`, `capacity_exceeded`, `stay_restriction`, `advance_notice`, `booking_window`, `dates_unavailable`, and `calendar_unverified`. `calendar_unverified` gives HTTP 503 on a quote. Other unavailable stays give HTTP 409. Public responses never contain block notes, reasons, calendar URLs, imported UIDs, or export tokens.

## Admin

Every route below is under `/api/v1/admin` and uses the existing development admin bearer token. Production admin access remains closed until production authentication exists.

| Method        | Path                                                      | Purpose                                                      |
| ------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| GET           | `/apartments/:id/availability?startDate=&endDate=`        | Day statuses, manual blocks, freshness                       |
| GET, POST     | `/apartments/:id/blocks`                                  | List and create manual blocks                                |
| PATCH, DELETE | `/apartments/:id/blocks/:blockId`                         | Update or soft-remove a block                                |
| GET, PATCH    | `/apartments/:id/pricing`                                 | Read and update base rate, stay rules, freshness requirement |
| PUT, DELETE   | `/apartments/:id/pricing/overrides/:date`                 | Set or remove date rate; PUT body `{nightlyRateMinor}`       |
| PUT, DELETE   | `/apartments/:id/pricing/weekdays/:weekday`               | Set or remove weekday rate; Sunday is 0                      |
| PUT, DELETE   | `/apartments/:id/pricing/discounts/:minNights`            | Set or remove a discount; PUT body `{discountBps}`           |
| POST          | `/apartments/:id/quote-preview`                           | Calculate price without a bookability assertion              |
| GET, POST     | `/apartments/:id/calendar-connections`                    | List status or create with `{url}`                           |
| PATCH, DELETE | `/apartments/:id/calendar-connections/:connectionId`      | Change `url`/`enabled` or remove                             |
| POST          | `/apartments/:id/calendar-connections/:connectionId/sync` | Import now                                                   |
| POST, DELETE  | `/apartments/:id/export-token`                            | Rotate (return once) or revoke the secret                    |

Manual block creation takes `{startDate, endDate, reason, notes?}`. Reason is `MAINTENANCE`, `OWNER_USE`, `CLEANING`, or `OTHER`; notes are internal. Removal preserves the record with `removedAt`. Admin data and feed URLs should be protected as credentials.

The pricing PATCH accepts `baseNightlyRateMinor`, `minStayNights`, `maxStayNights`, `advanceNoticeDays`, `bookingWindowDays`, `requireExternalSync`, and `freshnessMinutes`. Defaults are minimum 1 night, no maximum/notice/window, external sync required, freshness 240 minutes. An administrator must explicitly set `requireExternalSync: false` for an apartment that intentionally has no Airbnb feed. Missing, never synced, failed, or stale required feeds fail closed.

Availability is advisory. M2 has no reservations or database overlap exclusion for bookings; M3 must recheck and lock when creating reservations.
