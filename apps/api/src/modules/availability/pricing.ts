import { ApiError } from '../../middleware/error.js';
import { addDays, formatDate } from './dates.js';

export interface PricingInput {
  start: Date;
  nights: number;
  baseRate: number | null;
  overrides: { date: Date; nightlyRateMinor: number }[];
  weekdays: { weekday: number; nightlyRateMinor: number }[];
  discounts: { minNights: number; discountBps: number }[];
}

export function priceStay(input: PricingInput) {
  const overrides = new Map(
    input.overrides.map((rate) => [
      formatDate(rate.date),
      rate.nightlyRateMinor,
    ]),
  );
  const weekdays = new Map(
    input.weekdays.map((rate) => [rate.weekday, rate.nightlyRateMinor]),
  );
  const nightly = Array.from({ length: input.nights }, (_, index) => {
    const date = addDays(input.start, index);
    const override = overrides.get(formatDate(date));
    const weekday = weekdays.get(date.getUTCDay());
    const rate = override ?? weekday ?? input.baseRate;
    if (rate == null || !Number.isSafeInteger(rate) || rate <= 0)
      throw new ApiError(
        409,
        'pricing_unconfigured',
        'A valid nightly rate is required for every night',
      );
    return {
      date: formatDate(date),
      nightlyRateMinor: rate,
      source:
        override != null ? 'override' : weekday != null ? 'weekday' : 'base',
    };
  });
  const subtotal = nightly.reduce(
    (sum, night) => sum + BigInt(night.nightlyRateMinor),
    0n,
  );
  const applicable = input.discounts
    .filter((discount) => discount.minNights <= input.nights)
    .sort((a, b) => b.minNights - a.minNights)[0];
  const bps = applicable?.discountBps ?? 0;
  if (!Number.isInteger(bps) || bps < 0 || bps >= 10000)
    throw new ApiError(
      500,
      'invalid_pricing',
      'Invalid discount configuration',
    );
  const discount = (subtotal * BigInt(bps) + 5000n) / 10000n;
  const total = subtotal - discount;
  if (subtotal > BigInt(Number.MAX_SAFE_INTEGER))
    throw new ApiError(409, 'price_overflow', 'Price exceeds supported range');
  return {
    nightly,
    accommodationSubtotalMinor: Number(subtotal),
    appliedDiscount: applicable
      ? {
          minNights: applicable.minNights,
          discountBps: bps,
          amountMinor: Number(discount),
        }
      : null,
    discountTotalMinor: Number(discount),
    accommodationTotalMinor: Number(total),
  };
}
