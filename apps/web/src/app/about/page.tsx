import Link from 'next/link';
import { LOCAL_RECOMMENDATIONS } from '@/lib/data';
import { ArrowRightIcon, SparkleIcon } from '@/components/icons';

export default function AboutPage() {
  return (
    <div className="bg-cream-light pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Hero */}
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
              Our Story
            </p>
            <h1 className="mt-3 font-editorial text-5xl font-medium leading-[1.05] text-teal-deep sm:text-6xl">
              Modern Ghanaian hospitality, rooted in warmth and calm.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-teal-deep/80">
              Kasvin Homes was created for travellers who want the privacy and
              generous space of a designer residence without sacrificing the
              reliability, cleanliness, and attentive service of a boutique
              hotel.
            </p>
            <p className="mt-4 text-base leading-relaxed text-teal-deep/75">
              With just four individually styled residences—Sirius, Emerald,
              Eos, and Apollo—every guest receives personal attention. From
              uninterrupted power and fibre Wi-Fi to curated meals and airport
              transfers, we handle the essentials quietly so you can focus on
              your trip.
            </p>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] lg:col-span-6">
            <img
              src="/images/hero-residence.jpg"
              alt="Kasvin Homes interior architecture"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Philosophy cards */}
        <section className="mt-24 grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Intimate Scale',
              body: 'Only four private residences—meaning quiet corridors, personal care, and consistently immaculate spaces.',
            },
            {
              title: 'Zero Friction',
              body: 'Transparent pricing in Ghana Cedis, instant Paystack booking with no mandatory account sign-up, and direct WhatsApp access.',
            },
            {
              title: 'Curated Local Ties',
              body: 'We partner with trusted local chefs, chauffeurs, and rental providers so your entire stay feels effortless.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[26px] border border-teal-deep/10 bg-white p-8"
            >
              <SparkleIcon className="w-5 h-5 text-coral" />
              <h2 className="mt-5 font-editorial text-3xl font-medium text-teal-deep">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-teal-deep/75">
                {item.body}
              </p>
            </div>
          ))}
        </section>

        {/* Local Recommendations */}
        <section className="mt-24 rounded-[32px] bg-teal-deep p-8 text-cream sm:p-14">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
              Local Guide
            </p>
            <h2 className="mt-3 font-editorial text-4xl font-medium text-cream sm:text-5xl">
              Curated local recommendations around Kasvin Homes.
            </h2>
            <p className="mt-3 text-sm text-cream/75">
              Upon booking confirmation, you also receive our full Digital Guest
              Guide with pinned maps and favourite spots.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {LOCAL_RECOMMENDATIONS.map((group) => (
              <div
                key={group.category}
                className="rounded-2xl border border-cream/10 bg-cream/5 p-6"
              >
                <h3 className="font-editorial text-2xl font-medium text-coral">
                  {group.category}
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-cream/80">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-coral shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/apartments"
              className="inline-flex items-center gap-2 rounded-full bg-coral px-7 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep transition hover:bg-cream"
            >
              <span>Explore Our Residences</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
