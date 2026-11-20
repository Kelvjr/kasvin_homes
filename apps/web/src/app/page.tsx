import Link from 'next/link';
import { APARTMENTS, GUEST_REVIEWS, SERVICES } from '@/lib/data';
import { ApartmentCard } from '@/components/ApartmentCard';
import { AvailabilityBar } from '@/components/AvailabilityBar';
import { Reveal } from '@/components/Reveal';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ShieldIcon,
  SparkleIcon,
  StarIcon,
  WifiIcon,
} from '@/components/icons';

const PILLARS = [
  {
    icon: SparkleIcon,
    title: 'Architectural Calm',
    description:
      'Four thoughtfully composed residences bathed in warm natural light, limestone tones, and bespoke finishes.',
  },
  {
    icon: WifiIcon,
    title: 'Seamless Living',
    description:
      'Uninterrupted backup power, high-speed fibre internet, and whisper-quiet climate control in every room.',
  },
  {
    icon: ShieldIcon,
    title: 'Private & Secure',
    description:
      '24/7 manned security, CCTV coverage, private parking, and effortless self-paced arrival.',
  },
];

export default function HomePage() {
  return (
    <div className="bg-cream-light">
      {/* HERO */}
      <section className="relative flex min-h-[96vh] flex-col justify-end overflow-hidden bg-teal-deep pb-14 pt-32 sm:pb-20">
        {/* Background photography */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-residence.jpg"
            alt="Kasvin Homes luxury living space in Ghana"
            className="h-full w-full object-cover object-center scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-deep via-teal-deep/55 to-teal-deep/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-deep/75 via-transparent to-teal-deep/30" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cream/20 bg-teal-deep/50 px-4 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              <span className="text-[11px] font-medium tracking-[0.22em] uppercase text-cream">
                Accra, Ghana · Four Private Residences
              </span>
            </div>

            <h1 className="mt-7 font-editorial text-5xl font-medium leading-[1.03] tracking-tight text-cream sm:text-7xl lg:text-[82px]">
              Refined short-stay living,{' '}
              <span className="italic text-coral">effortlessly</span> yours.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/80 sm:text-lg">
              Discover Kasvin Homes—four curated luxury residences designed for
              discerning travellers, paired with private dining, airport
              transfers, and 24/7 concierge care.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/apartments"
                className="group inline-flex items-center gap-2.5 rounded-full bg-cream px-7 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep transition-all duration-300 hover:bg-coral"
              >
                <span>Explore Residences</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/5 px-7 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase text-cream backdrop-blur-md transition hover:border-coral hover:text-coral"
              >
                <span>Concierge Services</span>
              </Link>
            </div>
          </div>

          {/* Floating Availability Search */}
          <div className="mt-14 sm:mt-16">
            <AvailabilityBar />
          </div>
        </div>
      </section>

      {/* WHY KASVIN / EDITORIAL INTRO */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
                The Kasvin Standard
              </p>
              <h2 className="mt-4 font-editorial text-4xl font-medium leading-[1.08] text-teal-deep sm:text-6xl">
                Designed to feel like a private sanctuary, run with
                boutique-hotel precision.
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-base leading-relaxed text-teal-deep/75">
                Every detail at Kasvin Homes is considered—from crisp cotton
                linens and uninterrupted power to curated local dining and
                seamless airport arrivals. No mandatory account sign-ups, no
                friction: just arrive and exhale.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <Reveal key={pillar.title} delayMs={i * 100}>
                <div className="h-full rounded-[26px] border border-teal-deep/10 bg-cream/60 p-8 transition-all duration-300 hover:border-coral/40 hover:bg-cream">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-deep text-coral">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-6 font-editorial text-2xl font-semibold text-teal-deep">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-teal-deep/75">
                    {pillar.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* FEATURED APARTMENTS */}
      <section className="border-t border-teal-deep/10 bg-cream/40 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
                  The Collection
                </p>
                <h2 className="mt-3 font-editorial text-4xl font-medium text-teal-deep sm:text-6xl">
                  Four distinct residences.
                </h2>
              </div>
              <Link
                href="/apartments"
                className="group inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-teal-deep transition hover:text-coral"
              >
                <span>Compare All Four</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {APARTMENTS.map((apartment, index) => (
              <Reveal key={apartment.id} delayMs={index * 90}>
                <ApartmentCard apartment={apartment} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CURATED SERVICES (DEEP TEAL EDITORIAL BAND) */}
      <section className="bg-teal-deep py-24 text-cream lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
                  Beyond Accommodation
                </p>
                <h2 className="mt-4 font-editorial text-4xl font-medium leading-[1.08] text-cream sm:text-6xl">
                  Curated services arranged around your stay.
                </h2>
              </div>
              <Link
                href="/services"
                className="group inline-flex items-center gap-2 rounded-full border border-cream/25 px-6 py-3 text-xs font-semibold tracking-[0.16em] uppercase text-cream transition hover:border-coral hover:bg-coral hover:text-teal-deep"
              >
                <span>Explore All Services</span>
                <ArrowUpRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-3">
            {SERVICES.map((service, index) => (
              <Reveal key={service.id} delayMs={index * 100}>
                <Link
                  href="/services"
                  className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-cream/10 bg-teal-mid/40 transition-all duration-500 hover:border-coral/40 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="luxury-image h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/80 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-7">
                    <div>
                      <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-coral">
                        {service.availability}
                      </p>
                      <h3 className="mt-2 font-editorial text-3xl font-medium text-cream group-hover:text-coral transition-colors">
                        {service.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-cream/75">
                        {service.description}
                      </p>
                    </div>
                    <p className="mt-6 border-t border-cream/10 pt-4 text-xs text-cream/60">
                      {service.pricingNote}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOTION BANNER */}
      <section className="mx-auto max-w-7xl px-6 pt-24 lg:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-coral p-10 text-teal-deep sm:p-14">
            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-block rounded-full bg-teal-deep px-3.5 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase text-cream">
                  Extended Stay Offer
                </span>
                <h2 className="mt-4 font-editorial text-4xl font-semibold leading-tight sm:text-5xl">
                  Stay 5 nights or more and enjoy 10% off your residence rate.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-teal-deep/85 sm:text-base">
                  Applied automatically during online checkout—plus
                  complimentary welcome refreshments upon arrival.
                </p>
              </div>
              <Link
                href="/book"
                className="group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-teal-deep px-8 py-4 text-xs font-semibold tracking-[0.16em] uppercase text-cream transition hover:bg-cream hover:text-teal-deep"
              >
                <span>Reserve Your Dates</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* GUEST REVIEWS */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
              Guest Impressions
            </p>
            <h2 className="mt-3 font-editorial text-4xl font-medium text-teal-deep sm:text-6xl">
              Words from those who have stayed with us.
            </h2>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {GUEST_REVIEWS.map((review, index) => (
            <Reveal key={review.id} delayMs={index * 100}>
              <article className="flex h-full flex-col justify-between rounded-[26px] border border-teal-deep/10 bg-white p-8 shadow-sm">
                <div>
                  <div className="flex items-center gap-1 text-coral">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4" />
                    ))}
                  </div>
                  <p className="mt-6 font-editorial text-2xl leading-snug text-teal-deep">
                    “{review.quote}”
                  </p>
                </div>
                <div className="mt-8 border-t border-teal-deep/10 pt-5">
                  <p className="text-sm font-semibold text-teal-deep">
                    {review.guestName}
                  </p>
                  <p className="text-xs text-teal-deep/65">
                    {review.origin} · {review.apartment} · {review.stayDate}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FINAL BOOKING CTA */}
      <section className="bg-cream py-24 border-t border-teal-deep/10">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <Reveal>
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
              Ready When You Are
            </p>
            <h2 className="mt-4 font-editorial text-5xl font-medium text-teal-deep sm:text-6xl">
              Your private Ghanaian residence awaits.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-teal-deep/75">
              Book online in minutes with instant Paystack confirmation, or
              speak directly with our concierge on WhatsApp to tailor your stay.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-8 py-4 text-xs font-semibold tracking-[0.16em] uppercase text-cream transition hover:bg-coral hover:text-teal-deep"
              >
                <span>Book Now</span>
                <ArrowUpRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-teal-deep/25 px-8 py-4 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep transition hover:border-teal-deep hover:bg-teal-deep hover:text-cream"
              >
                <span>Speak to Concierge</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
