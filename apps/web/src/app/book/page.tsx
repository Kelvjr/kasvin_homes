'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { APARTMENTS, SERVICES, formatGhs } from '@/lib/data';
import { ArrowRightIcon, CheckIcon, ShieldIcon } from '@/components/icons';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const today = new Date();
  const defaultIn = new Date(today);
  defaultIn.setDate(today.getDate() + 1);
  const defaultOut = new Date(today);
  defaultOut.setDate(today.getDate() + 4);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const defaultApartment = APARTMENTS[0]!;
  const [selectedSlug, setSelectedSlug] = useState(
    searchParams.get('apartment') || defaultApartment.slug,
  );
  const [checkIn, setCheckIn] = useState(
    searchParams.get('checkIn') || fmt(defaultIn),
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get('checkOut') || fmt(defaultOut),
  );
  const [guests, setGuests] = useState(
    Number(searchParams.get('guests') || '2'),
  );

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [requestedServices, setRequestedServices] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const apartment = useMemo(
    () => APARTMENTS.find((a) => a.slug === selectedSlug) ?? defaultApartment,
    [selectedSlug, defaultApartment],
  );

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

  const toggleService = (title: string) => {
    setRequestedServices((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title],
    );
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    const ref = `KH-${today.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const params = new URLSearchParams({
      ref,
      apartment: apartment.name,
      slug: apartment.slug,
      checkIn,
      checkOut,
      nights: String(nights),
      guests: String(Math.min(guests, apartment.maxGuests)),
      total: String(total),
      name: fullName,
      email,
      services: requestedServices.join(', '),
    });
    setTimeout(() => {
      router.push(`/book/confirmation?${params.toString()}`);
    }, 650);
  };

  return (
    <div className="bg-cream-light pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
            Reservation & Checkout
          </p>
          <h1 className="mt-3 font-editorial text-5xl font-medium text-teal-deep sm:text-6xl">
            Reserve your Kasvin residence.
          </h1>
          <p className="mt-3 text-sm text-teal-deep/75">
            No account required. Complete 100% upfront payment via Paystack for
            instant booking confirmation.
          </p>
        </div>

        <form
          onSubmit={handleCheckout}
          className="mt-12 grid gap-10 lg:grid-cols-12"
        >
          {/* Left Form */}
          <div className="space-y-8 lg:col-span-8">
            {/* Step 1: Select Residence & Dates */}
            <section className="rounded-[28px] border border-teal-deep/10 bg-white p-7 sm:p-8">
              <h2 className="font-editorial text-3xl font-medium text-teal-deep">
                1. Residence & Stay Dates
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {APARTMENTS.map((apt) => {
                  const active = apt.slug === apartment.slug;
                  return (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() => {
                        setSelectedSlug(apt.slug);
                        if (guests > apt.maxGuests) setGuests(apt.maxGuests);
                      }}
                      className={`flex items-center gap-4 rounded-2xl border p-3.5 text-left transition ${
                        active
                          ? 'border-coral bg-cream/60 ring-2 ring-coral/25'
                          : 'border-teal-deep/10 hover:border-teal-deep/30'
                      }`}
                    >
                      <img
                        src={apt.heroImage}
                        alt={apt.name}
                        className="h-16 w-20 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <p className="font-editorial text-xl font-semibold text-teal-deep">
                          {apt.name}
                        </p>
                        <p className="text-xs text-teal-deep/65">
                          {apt.bedrooms} Bed · Up to {apt.maxGuests} guests
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-coral">
                          {formatGhs(apt.nightlyRateGhs)} / night
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                    Check-in
                  </span>
                  <input
                    type="date"
                    value={checkIn}
                    min={fmt(today)}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                    Check-out
                  </span>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                    Guests
                  </span>
                  <select
                    value={Math.min(guests, apartment.maxGuests)}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                  >
                    {Array.from({ length: apartment.maxGuests }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {/* Step 2: Guest Details */}
            <section className="rounded-[28px] border border-teal-deep/10 bg-white p-7 sm:p-8">
              <h2 className="font-editorial text-3xl font-medium text-teal-deep">
                2. Guest Details
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                    Full Name
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ama Mensah"
                    className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                    Email Address
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ama@example.com"
                    className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                  />
                </label>
                <label>
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                    Phone / WhatsApp Number
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+233 20 000 0000"
                    className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                    Special Requests (Optional)
                  </span>
                  <textarea
                    rows={3}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Estimated arrival time, dietary notes, or celebration setup..."
                    className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                  />
                </label>
              </div>
            </section>

            {/* Step 3: Optional Services */}
            <section className="rounded-[28px] border border-teal-deep/10 bg-white p-7 sm:p-8">
              <h2 className="font-editorial text-3xl font-medium text-teal-deep">
                3. Add-On Concierge Services (Optional)
              </h2>
              <p className="mt-1 text-xs text-teal-deep/65">
                Select any services you’d like our concierge to arrange. Pricing
                is confirmed separately based on your itinerary.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {SERVICES.map((service) => {
                  const selected = requestedServices.includes(service.title);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.title)}
                      className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition ${
                        selected
                          ? 'border-coral bg-cream/70'
                          : 'border-teal-deep/10 hover:border-teal-deep/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-teal-deep">
                          {service.title}
                        </span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border shrink-0 ${
                            selected
                              ? 'border-coral bg-coral text-teal-deep'
                              : 'border-teal-deep/25'
                          }`}
                        >
                          {selected && <CheckIcon className="w-3 h-3" />}
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-teal-deep/65">
                        {service.pricingNote}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Summary & Paystack CTA */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-[28px] bg-teal-deep p-7 text-cream shadow-2xl shadow-teal-deep/20">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-coral">
                Booking Summary
              </p>
              <h2 className="mt-2 font-editorial text-3xl font-medium text-cream">
                {apartment.name}
              </h2>
              <p className="text-xs text-cream/70">
                {checkIn} → {checkOut} · {nights}{' '}
                {nights === 1 ? 'night' : 'nights'} ·{' '}
                {Math.min(guests, apartment.maxGuests)} guest(s)
              </p>

              <div className="mt-6 space-y-3 border-t border-cream/15 pt-5 text-sm">
                <div className="flex justify-between text-cream/80">
                  <span>
                    {formatGhs(apartment.nightlyRateGhs)} × {nights} nights
                  </span>
                  <span>{formatGhs(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-coral">
                    <span>5+ Night Discount (10%)</span>
                    <span>−{formatGhs(discount)}</span>
                  </div>
                )}
                {requestedServices.length > 0 && (
                  <div className="flex justify-between text-xs text-cream/70">
                    <span>Concierge add-ons ({requestedServices.length})</span>
                    <span>Quoted separately</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-cream/15 pt-4 text-lg font-semibold text-cream">
                  <span>Total Due Now</span>
                  <span>{formatGhs(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep transition hover:bg-cream disabled:opacity-60"
              >
                <span>
                  {processing
                    ? 'Verifying with Paystack...'
                    : `Pay ${formatGhs(total)} via Paystack`}
                </span>
                {!processing && (
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                )}
              </button>

              <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-cream/5 p-3.5 text-[11px] leading-relaxed text-cream/70">
                <ShieldIcon className="w-4 h-4 text-coral shrink-0 mt-0.5" />
                <span>
                  100% upfront online payment via Paystack (Card, Mobile Money,
                  Bank). By booking, you agree to our{' '}
                  <Link href="/policies" className="text-coral underline">
                    Policies & Terms
                  </Link>
                  .
                </span>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-light pt-32 text-center text-sm text-teal-deep/60">
          Preparing your reservation...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
