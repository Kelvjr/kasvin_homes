import Link from 'next/link';
import { CheckIcon, ShieldIcon, WifiIcon } from '@/components/icons';

export default function PoliciesPage() {
  return (
    <div className="bg-cream-light pt-28 pb-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
          Guest Information
        </p>
        <h1 className="mt-3 font-editorial text-5xl font-medium text-teal-deep sm:text-6xl">
          Policies, Terms & Digital Guest Guide
        </h1>
        <p className="mt-4 max-w-2xl text-base text-teal-deep/75">
          Clear, transparent booking terms and everything you need for an
          effortless stay at Kasvin Homes.
        </p>

        {/* Policy Cards */}
        <div className="mt-14 space-y-6">
          <section className="rounded-[28px] border border-teal-deep/10 bg-white p-8">
            <h2 className="font-editorial text-3xl font-medium text-teal-deep">
              Check-In & Check-Out
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-cream/60 p-5">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-coral">
                  Check-In
                </p>
                <p className="mt-1 font-editorial text-2xl font-semibold text-teal-deep">
                  From 3:00 PM
                </p>
                <p className="mt-1 text-xs text-teal-deep/70">
                  Early check-in may be arranged in advance subject to
                  availability.
                </p>
              </div>
              <div className="rounded-2xl bg-cream/60 p-5">
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-coral">
                  Check-Out
                </p>
                <p className="mt-1 font-editorial text-2xl font-semibold text-teal-deep">
                  By 11:00 AM
                </p>
                <p className="mt-1 text-xs text-teal-deep/70">
                  Late check-out requests should be confirmed with concierge at
                  least 24 hours prior.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-teal-deep/10 bg-white p-8">
            <h2 className="font-editorial text-3xl font-medium text-teal-deep">
              Booking, Cancellations & Refunds
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-teal-deep/80">
              <li className="flex items-start gap-3">
                <CheckIcon className="w-4 h-4 mt-0.5 text-coral shrink-0" />
                <span>
                  <strong>Payment:</strong> Reservations require 100% upfront
                  online payment via Paystack to lock in your dates immediately.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-4 h-4 mt-0.5 text-coral shrink-0" />
                <span>
                  <strong>Full Refund:</strong> Cancellations made at least 7
                  days before check-in receive a 100% refund.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckIcon className="w-4 h-4 mt-0.5 text-coral shrink-0" />
                <span>
                  <strong>Partial Refund:</strong> Cancellations made 3–6 days
                  before check-in receive a 50% refund. Cancellations within 48
                  hours of check-in are non-refundable.
                </span>
              </li>
            </ul>
          </section>

          <section className="rounded-[28px] border border-teal-deep/10 bg-white p-8">
            <h2 className="font-editorial text-3xl font-medium text-teal-deep">
              Property Rules
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-teal-deep/80">
              <li>• Strictly no smoking inside any residence.</li>
              <li>
                • Quiet hours are observed from 10:00 PM to 7:00 AM for all
                guests’ comfort.
              </li>
              <li>• No parties, events, or unregistered overnight guests.</li>
              <li>
                • Please treat furnishings and appliances with care; damages may
                be billed.
              </li>
            </ul>
          </section>
        </div>

        {/* Digital Guest Guide */}
        <section
          id="guest-guide"
          className="mt-14 rounded-[32px] bg-teal-deep p-8 text-cream sm:p-12"
        >
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
            Digital Guest Guide
          </p>
          <h2 className="mt-2 font-editorial text-4xl font-medium text-cream">
            Essential stay information at your fingertips.
          </h2>
          <p className="mt-2 text-sm text-cream/75">
            Exact Wi-Fi credentials and smart-access details are provided upon
            check-in.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-cream/10 bg-cream/5 p-6">
              <WifiIcon className="w-5 h-5 text-coral" />
              <h3 className="mt-3 font-editorial text-2xl text-cream">
                Wi-Fi & Backup Power
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-cream/75">
                High-speed fibre Wi-Fi is active 24/7. Our automatic inverter
                system transitions seamlessly during grid outages so work and
                streaming stay uninterrupted.
              </p>
            </div>
            <div className="rounded-2xl border border-cream/10 bg-cream/5 p-6">
              <ShieldIcon className="w-5 h-5 text-coral" />
              <h3 className="mt-3 font-editorial text-2xl text-cream">
                Security & Emergency Contacts
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-cream/75">
                24/7 on-site security and CCTV. For urgent assistance during
                your stay, contact Kasvin Concierge on WhatsApp or call +233 20
                000 0000 anytime.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep transition hover:bg-cream"
            >
              Request Meals, Transfers or Car Rental
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
