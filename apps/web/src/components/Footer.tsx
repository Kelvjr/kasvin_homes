import Link from 'next/link';
import { MapPinIcon, PhoneIcon, WhatsAppIcon } from './icons';

export function Footer() {
  return (
    <footer className="bg-teal-deep text-cream border-t border-cream/10">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4 space-y-6">
            <img
              src="/brand/logo-wordmark.png"
              alt="Kasvin Homes"
              className="h-10 w-auto object-contain"
            />
            <p className="max-w-sm text-sm leading-relaxed text-cream/75">
              Four curated luxury short-stay residences in Ghana, designed for
              calm, privacy, and effortless hospitality—with bespoke concierge
              services from arrival to departure.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3.5 py-1.5 text-xs text-cream/80">
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                Instant Paystack Booking
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3.5 py-1.5 text-xs text-cream/80">
                24/7 Concierge
              </span>
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2 space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-coral">
              Explore
            </p>
            <ul className="space-y-3 text-sm text-cream/80">
              <li>
                <Link
                  href="/apartments"
                  className="transition hover:text-coral"
                >
                  Our Residences
                </Link>
              </li>
              <li>
                <Link href="/services" className="transition hover:text-coral">
                  Guest Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition hover:text-coral">
                  About Kasvin
                </Link>
              </li>
              <li>
                <Link href="/book" className="transition hover:text-coral">
                  Book a Stay
                </Link>
              </li>
            </ul>
          </div>

          {/* Residences */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-coral">
              The Collection
            </p>
            <ul className="space-y-3 text-sm text-cream/80">
              <li>
                <Link
                  href="/apartments/sirius"
                  className="transition hover:text-coral"
                >
                  The Sirius Residence · 2 Bed
                </Link>
              </li>
              <li>
                <Link
                  href="/apartments/emerald"
                  className="transition hover:text-coral"
                >
                  The Emerald Residence · 2 Bed
                </Link>
              </li>
              <li>
                <Link
                  href="/apartments/eos"
                  className="transition hover:text-coral"
                >
                  The Eos Suite · 1 Bed
                </Link>
              </li>
              <li>
                <Link
                  href="/apartments/apollo"
                  className="transition hover:text-coral"
                >
                  The Apollo Suite · 1 Bed
                </Link>
              </li>
            </ul>
          </div>

          {/* Guest Info & Contact */}
          <div className="lg:col-span-3 space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-coral">
              Concierge & Info
            </p>
            <ul className="space-y-3 text-sm text-cream/80">
              <li className="flex items-start gap-2.5">
                <MapPinIcon className="w-4 h-4 mt-0.5 text-coral shrink-0" />
                <span>
                  Accra, Ghana · Exact directions shared upon confirmation
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <PhoneIcon className="w-4 h-4 text-coral shrink-0" />
                <a
                  href="tel:+233200000000"
                  className="transition hover:text-coral"
                >
                  +233 20 000 0000
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <WhatsAppIcon className="w-4 h-4 text-coral shrink-0" />
                <a
                  href="https://wa.me/233200000000?text=Hello%20Kasvin%20Homes%2C%20I%20would%20like%20to%20enquire%20about%20a%20stay."
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-coral"
                >
                  WhatsApp Concierge
                </a>
              </li>
              <li className="pt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-cream/65">
                <Link
                  href="/policies"
                  className="underline underline-offset-4 hover:text-coral"
                >
                  Policies & Terms
                </Link>
                <Link
                  href="/policies#guest-guide"
                  className="underline underline-offset-4 hover:text-coral"
                >
                  Digital Guest Guide
                </Link>
                <Link
                  href="/contact"
                  className="underline underline-offset-4 hover:text-coral"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-cream/10 pt-8 text-xs text-cream/55 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Kasvin Homes. All rights reserved.</p>
          <p>
            Crafted for modern Ghanaian hospitality · Payments secured by
            Paystack
          </p>
        </div>
      </div>
    </footer>
  );
}
