'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Apartment, formatGhs } from '@/lib/data';
import {
  ArrowRightIcon,
  BathIcon,
  BedIcon,
  CalendarIcon,
  CheckIcon,
  UsersIcon,
} from '@/components/icons';

interface Props {
  apartment: Apartment;
}

export function ApartmentDetailClient({ apartment }: Props) {
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);

  const today = new Date();
  const defaultIn = new Date(today);
  defaultIn.setDate(today.getDate() + 1);
  const defaultOut = new Date(today);
  defaultOut.setDate(today.getDate() + 4);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(fmt(defaultIn));
  const [checkOut, setCheckOut] = useState(fmt(defaultOut));
  const [guests, setGuests] = useState(Math.min(2, apartment.maxGuests));

  const nights = useMemo(() => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  const subtotal = nights * apartment.nightlyRateGhs;
  const discount = nights >= 5 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      apartment: apartment.slug,
      checkIn,
      checkOut,
      guests: String(guests),
    });
    router.push(`/book?${params.toString()}`);
  };

  // Current month calendar preview
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const monthName = today.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();

  return (
    <div className="bg-cream-light pt-24 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs tracking-[0.14em] uppercase text-teal-deep/60">
          <Link href="/" className="hover:text-coral">
            Home
          </Link>
          <span>/</span>
          <Link href="/apartments" className="hover:text-coral">
            Apartments
          </Link>
          <span>/</span>
          <span className="text-teal-deep font-semibold">{apartment.name}</span>
        </div>

        {/* Title row */}
        <div className="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <span className="inline-block rounded-full bg-coral/15 px-3.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-teal-deep">
              {apartment.unitPosition} · {apartment.sizeSqm} m²
            </span>
            <h1 className="mt-3 font-editorial text-5xl font-medium text-teal-deep sm:text-6xl">
              {apartment.name}
            </h1>
            <p className="mt-2 text-base text-teal-deep/75">
              {apartment.tagline}
            </p>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-xs tracking-[0.16em] uppercase text-teal-deep/60">
              Base Nightly Rate
            </p>
            <p className="font-editorial text-4xl font-semibold text-teal-deep">
              {formatGhs(apartment.nightlyRateGhs)}
              <span className="font-sans text-sm font-normal text-teal-deep/65">
                {' '}
                / night
              </span>
            </p>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] bg-teal-deep lg:col-span-9">
            <img
              src={apartment.gallery[activeImage]?.url ?? apartment.heroImage}
              alt={apartment.gallery[activeImage]?.caption ?? apartment.name}
              className="h-full w-full object-cover transition-all duration-500"
            />
            <div className="absolute bottom-5 left-5 rounded-full bg-teal-deep/80 px-4 py-1.5 text-xs text-cream backdrop-blur-md">
              {apartment.gallery[activeImage]?.caption}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 lg:col-span-3 lg:grid-cols-1">
            {apartment.gallery.map((img, idx) => (
              <button
                key={img.caption}
                type="button"
                onClick={() => setActiveImage(idx)}
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl border-2 transition ${
                  activeImage === idx
                    ? 'border-coral ring-2 ring-coral/30'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.caption}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content + Sticky Booking Sidebar */}
        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-12 lg:col-span-8">
            {/* Key Specs */}
            <div className="grid grid-cols-3 gap-4 rounded-3xl border border-teal-deep/10 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-coral">
                  <BedIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-teal-deep/60">Bedrooms</p>
                  <p className="text-sm font-semibold text-teal-deep">
                    {apartment.bedrooms}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-coral">
                  <BathIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-teal-deep/60">Bathrooms</p>
                  <p className="text-sm font-semibold text-teal-deep">
                    {apartment.bathrooms}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-coral">
                  <UsersIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-teal-deep/60">Capacity</p>
                  <p className="text-sm font-semibold text-teal-deep">
                    Up to {apartment.maxGuests}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-editorial text-3xl font-medium text-teal-deep">
                About this residence
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-teal-deep/80">
                {apartment.description.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="border-t border-teal-deep/10 pt-10">
              <h2 className="font-editorial text-3xl font-medium text-teal-deep">
                Facilities & Amenities
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {apartment.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 rounded-2xl border border-teal-deep/10 bg-white px-4 py-3.5 text-sm text-teal-deep"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-coral/15 text-coral">
                      <CheckIcon className="w-3.5 h-3.5" />
                    </span>
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Calendar Preview */}
            <div className="border-t border-teal-deep/10 pt-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-editorial text-3xl font-medium text-teal-deep">
                    Availability Calendar
                  </h2>
                  <p className="mt-1 text-sm text-teal-deep/70">
                    Synchronized with direct bookings and Airbnb iCal to prevent
                    double bookings.
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-1.5 text-xs font-semibold text-teal-deep">
                  <CalendarIcon className="w-3.5 h-3.5 text-coral" />
                  {monthName}
                </span>
              </div>

              <div className="mt-6 rounded-3xl border border-teal-deep/10 bg-white p-6">
                <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold tracking-wider uppercase text-teal-deep/50">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (d) => (
                      <div key={d} className="py-2">
                        {d}
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-2 text-center text-sm">
                  {Array.from({ length: firstWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const isBlocked =
                      apartment.blockedDaysOfMonth.includes(day);
                    return (
                      <div
                        key={day}
                        className={`flex h-10 items-center justify-center rounded-xl font-medium ${
                          isBlocked
                            ? 'bg-teal-deep/10 text-teal-deep/35 line-through'
                            : 'bg-cream/60 text-teal-deep'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center gap-6 text-xs text-teal-deep/70">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-cream border border-teal-deep/20" />
                    Available
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded bg-teal-deep/15" />
                    Reserved / Blocked
                  </span>
                </div>
              </div>
            </div>

            {/* House Rules */}
            <div className="border-t border-teal-deep/10 pt-10">
              <h2 className="font-editorial text-3xl font-medium text-teal-deep">
                House Rules
              </h2>
              <ul className="mt-5 space-y-3">
                {apartment.houseRules.map((rule) => (
                  <li
                    key={rule}
                    className="flex items-start gap-3 text-sm text-teal-deep/80"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-coral shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/policies"
                className="mt-5 inline-block text-xs font-semibold tracking-[0.14em] uppercase text-coral underline underline-offset-4 hover:text-teal-deep"
              >
                Read full policies & cancellation terms
              </Link>
            </div>
          </div>

          {/* Right sticky booking widget */}
          <aside className="lg:col-span-4">
            <form
              onSubmit={handleBook}
              className="sticky top-28 rounded-[28px] border border-teal-deep/15 bg-teal-deep p-7 text-cream shadow-2xl shadow-teal-deep/20"
            >
              <div className="flex items-baseline justify-between border-b border-cream/15 pb-5">
                <p className="font-editorial text-3xl font-semibold text-cream">
                  {formatGhs(apartment.nightlyRateGhs)}
                  <span className="font-sans text-xs font-normal text-cream/70">
                    {' '}
                    / night
                  </span>
                </p>
                <span className="rounded-full bg-coral/20 px-3 py-1 text-[11px] font-medium text-coral">
                  Instant Confirm
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-coral">
                    Check-in
                  </span>
                  <input
                    type="date"
                    value={checkIn}
                    min={fmt(today)}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none focus:border-coral [color-scheme:dark]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-coral">
                    Check-out
                  </span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none focus:border-coral [color-scheme:dark]"
                  />
                </label>

                <label className="block">
                  <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-coral">
                    Guests (max {apartment.maxGuests})
                  </span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none focus:border-coral"
                  >
                    {Array.from({ length: apartment.maxGuests }).map((_, i) => (
                      <option
                        key={i + 1}
                        value={i + 1}
                        className="bg-teal-deep text-cream"
                      >
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Price summary */}
              <div className="mt-6 space-y-2.5 border-t border-cream/15 pt-5 text-sm">
                <div className="flex justify-between text-cream/80">
                  <span>
                    {formatGhs(apartment.nightlyRateGhs)} × {nights}{' '}
                    {nights === 1 ? 'night' : 'nights'}
                  </span>
                  <span>{formatGhs(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-coral">
                    <span>Extended stay discount (10%)</span>
                    <span>−{formatGhs(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-cream/15 pt-3 text-base font-semibold text-cream">
                  <span>Total</span>
                  <span>{formatGhs(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep transition hover:bg-cream"
              >
                <span>Continue to Booking</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <p className="mt-4 text-center text-[11px] text-cream/60">
                100% upfront payment via Paystack · No account required
              </p>
            </form>
          </aside>
        </div>
      </div>
    </div>
  );
}
