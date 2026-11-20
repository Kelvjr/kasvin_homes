# Accommodation pricing (M2)

All monetary values are positive integer minor units. For GHS, one unit is one pesewa. Each occupied night chooses its date override, then its weekday rate, then the apartment base rate. A missing rate makes the quote unavailable. Overrides and weekday rates are unique per apartment and day/key, and PUT is idempotent.

The single applicable length discount is the configured rule with the highest `minNights` not exceeding the stay length. Discounts do not stack. `discountBps` is 1–9999 basis points (1000 means 10%). The discount is rounded once on the accommodation subtotal, half up to a minor unit: `(subtotal * bps + 5000) / 10000` using integer arithmetic. Totals are checked against JavaScript's safe integer range.

`POST /api/v1/quotes` returns apartment ID/name, check-in/out, nights, guest count, currency, `nightly[]` with date/rate/source, `accommodationSubtotalMinor`, `appliedDiscount`, `discountTotalMinor`, `accommodationTotalMinor`, `createdAt`, and `nonBinding: true`. The total is accommodation only. It excludes taxes, fees, payment charges, and future booking totals. A quote neither reserves dates nor guarantees later availability.

`POST /api/v1/admin/apartments/:id/quote-preview` uses the same calculation but bypasses public eligibility checks for administrative review. It must not be shown to guests as a bookable quote.
