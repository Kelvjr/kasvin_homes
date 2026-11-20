'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatGhs } from '@/lib/data';
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from '@/components/icons';

function ConfirmationContent() {
  const params = useSearchParams();
  const ref = params.get('ref') || 'KH-2026-8412';
  const apartment = params.get('apartment') || 'The Sirius Residence';
  const checkIn = params.get('checkIn') || '—';
  const checkOut = params.get('checkOut') || '—';
  const nights = params.get('nights') || '3';
  const guests = params.get('guests') || '2';
  const total = Number(params.get('total') || '2700');
  const name = params.get('name') || 'Valued Guest';
  const email = params.get('email') || '';
  const services = params.get('services') || '';

  return (
    <div className="bg-cream-light pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="overflow-hidden rounded-[32px] border border-teal-deep/10 bg-white shadow-xl shadow-teal-deep/5">
          {/* Header Banner */}
          <div className="bg-teal-deep px-8 py-12 text-center text-cream sm:px-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral text-teal-deep">
              <CheckIcon className="w-7 h-7" />
            </div>
            <p className="mt-5 text-xs font-semibold tracking-[0.22em] uppercase text-coral">
              Payment Verified · Booking Confirmed
            </p>
            <h1 className="mt-2 font-editorial text-4xl font-medium sm:text-5xl">
              We look forward to welcoming you, {name}.
            </h1>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cream/20 bg-cream/10 px-5 py-2 text-xs font-semibold tracking-[0.18em] uppercase text-cream">
              <span>Booking Reference:</span>
              <span className="text-coral">{ref}</span>
            </div>
          </div>

          {/* Summary Details */}
          <div className="p-8 sm:p-12">
            <div className="grid gap-6 border-b border-teal-deep/10 pb-8 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-teal-deep/55">
                  Residence
                </p>
                <p className="mt-1 font-editorial text-2xl font-semibold text-teal-deep">
                  {apartment}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-teal-deep/55">
                  Amount Paid (Paystack)
                </p>
                <p className="mt-1 font-editorial text-2xl font-semibold text-coral">
                  {formatGhs(total)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-teal-deep/55">
                  Dates
                </p>
                <p className="mt-1 text-sm font-medium text-teal-deep">
                  {checkIn} → {checkOut} ({nights} nights)
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-teal-deep/55">
                  Guests
                </p>
                <p className="mt-1 text-sm font-medium text-teal-deep">
                  {guests} Guest(s)
                </p>
              </div>
              {services && (
                <div className="sm:col-span-2">
                  <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-teal-deep/55">
                    Requested Concierge Services
                  </p>
                  <p className="mt-1 text-sm font-medium text-teal-deep">
                    {services}
                  </p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="mt-8 space-y-3">
              <h2 className="font-editorial text-2xl font-medium text-teal-deep">
                Next Steps
              </h2>
              <ul className="space-y-2.5 text-sm text-teal-deep/80">
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-coral shrink-0" />
                  <span>
                    A confirmation receipt and pinned property directions have
                    been prepared for{' '}
                    <span className="font-semibold text-teal-deep">
                      {email || 'your email'}
                    </span>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-coral shrink-0" />
                  <span>
                    Check-in begins at <strong>3:00 PM</strong>. Review Wi-Fi,
                    appliances, and check-in instructions anytime in our Digital
                    Guest Guide.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-coral shrink-0" />
                  <span>
                    Need airport pickup, catering, or a rental car? Message our
                    concierge with your reference <strong>{ref}</strong>.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/policies#guest-guide"
                className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-6 py-3.5 text-xs font-semibold tracking-[0.14em] uppercase text-cream transition hover:bg-coral hover:text-teal-deep"
              >
                <span>Open Digital Guest Guide</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <a
                href={`https://wa.me/233200000000?text=${encodeURIComponent(`Hello Kasvin Homes, my booking reference is ${ref}.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-teal-deep/20 px-6 py-3.5 text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep transition hover:border-coral hover:text-coral"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Message Concierge</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-light pt-32 text-center text-sm text-teal-deep/60">
          Loading confirmation...
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
