'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { APARTMENTS } from '@/lib/data';
import { ApartmentCard } from '@/components/ApartmentCard';

function ApartmentsContent() {
  const searchParams = useSearchParams();
  const initialGuests = Number(searchParams.get('guests') || '1');
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const [bedroomFilter, setBedroomFilter] = useState<'all' | '1' | '2'>('all');
  const [guestFilter, setGuestFilter] = useState<number>(
    Number.isFinite(initialGuests) && initialGuests >= 1 ? initialGuests : 1,
  );

  const filtered = useMemo(() => {
    return APARTMENTS.filter((apt) => {
      if (bedroomFilter !== 'all' && apt.bedrooms !== Number(bedroomFilter))
        return false;
      if (apt.maxGuests < guestFilter) return false;
      return true;
    });
  }, [bedroomFilter, guestFilter]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guestFilter > 1) params.set('guests', String(guestFilter));
    return params.toString();
  }, [checkIn, checkOut, guestFilter]);

  return (
    <div className="bg-cream-light pt-28 pb-24">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
            Our Residences
          </p>
          <h1 className="mt-3 font-editorial text-5xl font-medium leading-[1.05] text-teal-deep sm:text-6xl">
            Four private spaces, crafted for calm and comfort.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-teal-deep/75">
            Choose between our expansive two-bedroom residences (GH₵900/night)
            or intimate one-bedroom suites (GH₵600/night). All rates shown are
            base nightly rates before extended-stay discounts.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-teal-deep/10 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: 'all', label: 'All Residences (4)' },
                { key: '2', label: '2 Bedrooms · GH₵900' },
                { key: '1', label: '1 Bedroom · GH₵600' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setBedroomFilter(tab.key)}
                className={`rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase transition ${
                  bedroomFilter === tab.key
                    ? 'bg-teal-deep text-cream'
                    : 'bg-cream/60 text-teal-deep hover:bg-cream'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {checkIn && checkOut && (
              <span className="hidden rounded-full bg-coral/15 px-4 py-2 text-xs font-medium text-teal-deep sm:inline-block">
                {checkIn} → {checkOut}
              </span>
            )}
            <label className="flex items-center gap-2 rounded-full border border-teal-deep/15 px-4 py-2 text-xs font-medium text-teal-deep">
              <span>Guests:</span>
              <select
                value={guestFilter}
                onChange={(e) => setGuestFilter(Number(e.target.value))}
                className="bg-transparent font-semibold outline-none"
              >
                <option value={1}>1+</option>
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4</option>
              </select>
            </label>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="mt-14 rounded-3xl border border-teal-deep/10 bg-white p-12 text-center">
            <p className="font-editorial text-3xl text-teal-deep">
              No residences match that combination.
            </p>
            <p className="mt-2 text-sm text-teal-deep/70">
              Try selecting 2-bedroom residences for parties of 3–4 guests.
            </p>
            <button
              type="button"
              onClick={() => {
                setBedroomFilter('all');
                setGuestFilter(1);
              }}
              className="mt-6 rounded-full bg-teal-deep px-6 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-cream"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {filtered.map((apt) => (
              <ApartmentCard
                key={apt.id}
                apartment={apt}
                queryString={queryString}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function ApartmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-light pt-32 text-center text-sm text-teal-deep/60">
          Loading residences...
        </div>
      }
    >
      <ApartmentsContent />
    </Suspense>
  );
}
