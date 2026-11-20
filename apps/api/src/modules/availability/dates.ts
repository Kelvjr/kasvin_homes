import { ApiError } from '../../middleware/error.js';

const dayMs = 86_400_000;
export const dateString = /^\d{4}-\d{2}-\d{2}$/;

export function parseDate(value: unknown): Date {
  if (typeof value !== 'string' || !dateString.test(value))
    throw new ApiError(400, 'invalid_date', 'Use YYYY-MM-DD dates');
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new ApiError(400, 'invalid_date', 'Invalid calendar date');
  return date;
}

export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * dayMs);
}

export function accraToday(now: Date): Date {
  const text = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Accra',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return parseDate(text);
}

export function interval(
  checkIn: unknown,
  checkOut: unknown,
  now: Date,
  maxNights = 366,
) {
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  const nights = Math.round((end.getTime() - start.getTime()) / dayMs);
  if (nights < 1 || nights > maxNights)
    throw new ApiError(
      400,
      'invalid_interval',
      `Stay must be 1 to ${maxNights} nights`,
    );
  if (start < accraToday(now))
    throw new ApiError(400, 'past_date', 'Check-in cannot be in the past');
  return {
    start,
    end,
    nights,
    checkIn: formatDate(start),
    checkOut: formatDate(end),
  };
}

export function overlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
