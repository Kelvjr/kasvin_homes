# M3 preparation — pricing and isolated apartment fixtures

This work prepares data and tests for booking development. It does not create reservations, holds, guest records, payments, or booking management endpoints.

## Development pricing configuration

The four existing `kasvin_homes` apartments remain `DRAFT`, with their original UUIDs and GHS base rates: SIRIUS and EMERALD at 90,000 pesewas (GH₵900), EOS and APOLLO at 60,000 pesewas (GH₵600). Each apartment has the same four `LengthOfStayDiscount` rows:

| Occupied nights | Applied discount |    Stored threshold |
| --------------- | ---------------: | ------------------: |
| 1–2             |               0% |     No eligible row |
| 3–4             |               5% |   3 nights, 500 bps |
| 5–6             |              10% |  5 nights, 1000 bps |
| 7–29            |              15% |  7 nights, 1500 bps |
| 30–90           |              30% | 30 nights, 3000 bps |

The quote engine selects only the highest eligible threshold and applies its percentage once to the complete accommodation subtotal in integer minor units, rounded half up. It does not stack discounts. The existing quote limit is 90 nights; 91+ nights cannot be quoted. The additive migration `20261120090000_cap_stay_discount_at_30_percent` caps persisted discounts at 3000 bps. The admin API, service, and pricing engine also reject larger values. No date override or weekday rate was configured.

For a uniform GH₵900 base rate, the 3, 5, 7, and 30-night totals are GH₵2,565, GH₵4,050, GH₵5,355, and GH₵18,900. For a uniform GH₵600 base rate, the same totals are GH₵1,710, GH₵2,700, GH₵3,570, and GH₵12,600. These are accommodation-only, nonbinding quotes.

## Reusable PostgreSQL fixtures

`apps/api/src/tests/fixtures/m3-apartments.ts` exports `createM3ApartmentFixtures`, `assertM3TestDatabaseUrl`, and the fixed clock `M3_FIXTURE_NOW`. The guard accepts only `127.0.0.1` URLs whose database name matches `kasvin_m3_*_test`, then checks `current_database()` before any fixture mutation. It deletes and recreates only its own `M3_FIXTURE_*` records, in a transaction. It cannot target the development `kasvin_homes` database.

The fixture set has six synthetic apartments: published and available; published with a manual block; published with a fresh imported calendar block; published with a stale required calendar; draft; and unavailable. One-bedroom fixtures have capacity 3. The separate synthetic two-bedroom unavailable fixture has capacity 5 for other-capacity scenarios; this makes no claim about the real two-bedroom apartments. All have positive GHS base rates and required schema fields. The imported event is inserted as fixture data; no Airbnb URL is fetched.

`apps/api/src/tests/m3-prerequisites.integration.test.ts` exercises UUID selection, capacity, status, Accra date and stay validation, adjacent and overlapping half-open intervals, block isolation, stale-calendar fail-closed behavior, and discounted quotes at 1, 2, 3, 4, 5, 6, 7, 29, and 30 nights. It also tests the 30% cap at the API and database layers.

Set `M3_TEST_DATABASE_URL` to a **separate**, migrated local database such as `postgresql://...@127.0.0.1:5432/kasvin_m3_local_test`. Keep it distinct from `M1_TEST_DATABASE_URL`, `M2_TEST_DATABASE_URL`, and the development `DATABASE_URL`. Turborepo forwards all three test variables to `pnpm test`. Use `prisma migrate deploy` on a fresh test database before running integration tests. The tests use an injected clock of 15 January 2027 at noon UTC and never contact Airbnb.

## Ready for M3; remaining booking work

M2 already provides apartment UUIDs, capacity/status checks, strict Accra civil dates, minimum/maximum stay rules, manual and imported occupancy, sync freshness, and nonbinding discounted quotes. The production apartments still lack confirmed `maximumGuests`; they cannot be published until an administrator supplies those values. They remain drafts by design. For public availability after publication, an administrator must either establish a fresh external calendar connection or deliberately disable the requirement per apartment.

M3 must add reservation persistence, transactional prevention of overlapping active reservations, hold/expiration and booking status rules, idempotency and concurrency tests, and a final availability/price recheck at commitment time. M2 quotes do not reserve dates. Payment and guest account work remain outside this preparation step.

## Verification (20 November 2026 UTC)

The protected M2 admin pricing API configured 16 discount rows in the development database. Quote previews for all four apartments passed at 1, 2, 3, 4, 5, 6, 7, 29, and 30 nights, including exact subtotal, discount, and accommodation total in pesewas. A direct PostgreSQL query confirmed the four original UUIDs and base rates, all four `DRAFT` statuses, no weekday or date overrides, and no `M3_FIXTURE_*` records in the development database. All three migrations are current there.

`pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and Prisma validation passed. The root test run used three separate local databases for M1, M2, and M3 prerequisite integration tests: **42 passed, 0 failed, 0 skipped** in the API package. Lint reports only existing advisory website image warnings. No live Airbnb connection was used.
