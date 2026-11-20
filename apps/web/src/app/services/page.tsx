'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SERVICES } from '@/lib/data';
import { ArrowRightIcon, CheckIcon } from '@/components/icons';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState(
    SERVICES[0]?.title ?? 'Food & Private Catering',
  );
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-cream-light pt-28 pb-24">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
            Concierge & Lifestyle
          </p>
          <h1 className="mt-3 font-editorial text-5xl font-medium leading-[1.05] text-teal-deep sm:text-6xl">
            Thoughtful services arranged seamlessly around your stay.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-teal-deep/75">
            From freshly prepared Ghanaian and continental meals to punctual
            airport pickups and vetted car rentals, Kasvin Homes coordinates
            every detail—either during checkout or anytime after your booking is
            confirmed.
          </p>
        </div>

        {/* Service Sections */}
        <div className="mt-16 space-y-16">
          {SERVICES.map((service, index) => (
            <div
              key={service.id}
              className="grid items-center gap-10 overflow-hidden rounded-[32px] border border-teal-deep/10 bg-white p-6 shadow-sm lg:grid-cols-12 lg:p-10"
            >
              <div
                className={`relative aspect-[4/3] overflow-hidden rounded-3xl lg:col-span-6 ${
                  index % 2 === 1 ? 'lg:order-2' : ''
                }`}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div
                className={`lg:col-span-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}
              >
                <span className="inline-block rounded-full bg-cream px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] uppercase text-teal-deep">
                  {service.availability}
                </span>
                <h2 className="mt-4 font-editorial text-4xl font-medium text-teal-deep">
                  {service.title}
                </h2>
                <p className="mt-2 text-sm font-medium text-coral">
                  {service.subtitle}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-teal-deep/75">
                  {service.description}
                </p>

                <ul className="mt-6 space-y-2.5">
                  {service.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-teal-deep"
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coral/15 text-coral shrink-0">
                        <CheckIcon className="w-3 h-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-teal-deep/10 pt-5">
                  <p className="text-xs text-teal-deep/65">
                    {service.pricingNote}
                  </p>
                  <a
                    href="#request-service"
                    onClick={() => setSelectedService(service.title)}
                    className="inline-flex items-center gap-2 rounded-full bg-teal-deep px-5 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-cream transition hover:bg-coral hover:text-teal-deep"
                  >
                    <span>Request Service</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Service Request Form */}
        <section
          id="request-service"
          className="mt-20 rounded-[32px] bg-teal-deep p-8 text-cream sm:p-14"
        >
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
                Concierge Desk
              </p>
              <h2 className="mt-3 font-editorial text-4xl font-medium text-cream sm:text-5xl">
                Request a service for your stay.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/75">
                Already have a booking reference, or planning ahead? Share your
                preferences and our concierge will confirm availability and
                exact pricing via WhatsApp or email.
              </p>
              <div className="mt-8">
                <Link
                  href="/book"
                  className="text-xs font-semibold tracking-[0.16em] uppercase text-coral underline underline-offset-4 hover:text-cream"
                >
                  Or add services directly during booking →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              {submitted ? (
                <div className="rounded-3xl border border-cream/15 bg-cream/5 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-coral text-teal-deep">
                    <CheckIcon className="w-6 h-6" />
                  </div>
                  <h3 className="mt-5 font-editorial text-3xl text-cream">
                    Service enquiry received
                  </h3>
                  <p className="mt-2 text-sm text-cream/75">
                    Thank you, {name || 'Guest'}. Our concierge will reach out
                    shortly with options and pricing for{' '}
                    <span className="text-coral">{selectedService}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setNotes('');
                    }}
                    className="mt-6 rounded-full border border-cream/25 px-6 py-2.5 text-xs font-semibold tracking-[0.14em] uppercase text-cream hover:border-coral hover:text-coral"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="grid gap-4 sm:grid-cols-2"
                >
                  <label className="sm:col-span-2">
                    <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-coral">
                      Service Type
                    </span>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream outline-none focus:border-coral"
                    >
                      {SERVICES.map((s) => (
                        <option
                          key={s.id}
                          value={s.title}
                          className="bg-teal-deep text-cream"
                        >
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-coral">
                      Full Name
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-coral"
                    />
                  </label>

                  <label>
                    <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-coral">
                      WhatsApp or Email
                    </span>
                    <input
                      type="text"
                      required
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="+233 ... or email"
                      className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-coral"
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-coral">
                      Booking Reference (Optional)
                    </span>
                    <input
                      type="text"
                      value={bookingRef}
                      onChange={(e) => setBookingRef(e.target.value)}
                      placeholder="e.g. KH-2026-8412"
                      className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-coral"
                    />
                  </label>

                  <label className="sm:col-span-2">
                    <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-coral">
                      Details & Preferred Dates
                    </span>
                    <textarea
                      rows={3}
                      required
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tell us your flight time, meal preferences, or vehicle needs..."
                      className="mt-1.5 w-full rounded-xl border border-cream/15 bg-cream/5 px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-coral"
                    />
                  </label>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full rounded-full bg-coral px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep transition hover:bg-cream"
                    >
                      Send Service Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
