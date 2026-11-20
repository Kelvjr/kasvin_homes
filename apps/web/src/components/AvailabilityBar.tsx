'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowRightIcon, CalendarIcon, UsersIcon } from './icons';

export function AvailabilityBar() {
  const router = useRouter();
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const checkoutDefault = new Date(today);
  checkoutDefault.setDate(today.getDate() + 4);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const [checkIn, setCheckIn] = useState(fmt(tomorrow));
  const [checkOut, setCheckOut] = useState(fmt(checkoutDefault));
  const [guests, setGuests] = useState('2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests,
    });
    router.push(`/apartments?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-4xl rounded-3xl border border-cream/20 bg-teal-deep/90 p-3 shadow-[0_24px_70px_-20px_rgba(0,29,36,0.75)] backdrop-blur-xl sm:p-4"
    >
      <div className="grid gap-3 sm:grid-cols-12 sm:items-center">
        {/* Check-in */}
        <label className="flex flex-col rounded-2xl bg-cream/5 px-4 py-3 transition hover:bg-cream/10 sm:col-span-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-coral">
            <CalendarIcon className="w-3.5 h-3.5" />
            Check-in
          </span>
          <input
            type="date"
            value={checkIn}
            min={fmt(today)}
            onChange={(e) => setCheckIn(e.target.value)}
            required
            className="mt-1 bg-transparent text-sm font-medium text-cream outline-none [color-scheme:dark]"
          />
        </label>

        {/* Check-out */}
        <label className="flex flex-col rounded-2xl bg-cream/5 px-4 py-3 transition hover:bg-cream/10 sm:col-span-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-coral">
            <CalendarIcon className="w-3.5 h-3.5" />
            Check-out
          </span>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            required
            className="mt-1 bg-transparent text-sm font-medium text-cream outline-none [color-scheme:dark]"
          />
        </label>

        {/* Guests */}
        <label className="flex flex-col rounded-2xl bg-cream/5 px-4 py-3 transition hover:bg-cream/10 sm:col-span-3">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase text-coral">
            <UsersIcon className="w-3.5 h-3.5" />
            Guests
          </span>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="mt-1 bg-transparent text-sm font-medium text-cream outline-none"
          >
            <option value="1" className="bg-teal-deep text-cream">
              1 Guest
            </option>
            <option value="2" className="bg-teal-deep text-cream">
              2 Guests
            </option>
            <option value="3" className="bg-teal-deep text-cream">
              3 Guests
            </option>
            <option value="4" className="bg-teal-deep text-cream">
              4 Guests
            </option>
          </select>
        </label>

        {/* Submit */}
        <div className="sm:col-span-3">
          <button
            type="submit"
            className="group flex h-full w-full items-center justify-center gap-2 rounded-2xl bg-coral px-5 py-4 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep transition-all duration-300 hover:bg-cream"
          >
            <span>Check Dates</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </form>
  );
}
