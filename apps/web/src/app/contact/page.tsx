'use client';

import { useState } from 'react';
import { FAQS } from '@/lib/data';
import {
  CheckIcon,
  ChevronDownIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/icons';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-cream-light pt-28 pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
            Get in Touch
          </p>
          <h1 className="mt-3 font-editorial text-5xl font-medium leading-[1.05] text-teal-deep sm:text-6xl">
            We’re here before, during, and after your stay.
          </h1>
          <p className="mt-4 text-base text-teal-deep/75">
            Reach our concierge directly on WhatsApp for quick enquiries, or
            send us a message below.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          {/* Direct Channels */}
          <div className="space-y-5 lg:col-span-5">
            <a
              href="https://wa.me/233200000000?text=Hello%20Kasvin%20Homes%2C%20I%20have%20an%20enquiry."
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 rounded-3xl bg-teal-deep p-6 text-cream transition hover:bg-teal-mid"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-coral text-teal-deep shrink-0">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-coral">
                  Fastest Response
                </p>
                <h2 className="mt-1 font-editorial text-2xl font-medium">
                  WhatsApp Concierge
                </h2>
                <p className="mt-1 text-sm text-cream/75">
                  Direct chat for availability, airport pickups, and bespoke
                  stay requests.
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4 rounded-3xl border border-teal-deep/10 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-coral shrink-0">
                <PhoneIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep/60">
                  Phone
                </p>
                <p className="mt-1 text-base font-semibold text-teal-deep">
                  +233 20 000 0000
                </p>
                <p className="mt-0.5 text-xs text-teal-deep/65">
                  Available daily · 7:00 AM – 10:00 PM GMT
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl border border-teal-deep/10 bg-white p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-coral shrink-0">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep/60">
                  Location & Directions
                </p>
                <p className="mt-1 text-base font-semibold text-teal-deep">
                  Accra, Ghana
                </p>
                <p className="mt-1 text-xs leading-relaxed text-teal-deep/70">
                  For guest privacy and security, exact street coordinates, gate
                  access codes, and Google Maps directions are shared
                  immediately upon booking confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-[32px] border border-teal-deep/10 bg-white p-8 shadow-sm lg:col-span-7 sm:p-10">
            {sent ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral/15 text-coral">
                  <CheckIcon className="w-7 h-7" />
                </div>
                <h2 className="mt-5 font-editorial text-4xl text-teal-deep">
                  Message sent
                </h2>
                <p className="mt-2 text-sm text-teal-deep/75">
                  Thank you, {name}. Our hospitality team will respond to{' '}
                  {email} shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setMessage('');
                  }}
                  className="mt-6 rounded-full bg-teal-deep px-6 py-3 text-xs font-semibold tracking-[0.14em] uppercase text-cream"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-editorial text-3xl font-medium text-teal-deep">
                  Send an enquiry
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                      Full Name
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                      Email Address
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold tracking-[0.14em] uppercase text-teal-deep/70">
                    How can we help?
                  </span>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about dates, extended stays, airport pickups, or special arrangements..."
                    className="mt-1.5 w-full rounded-xl border border-teal-deep/15 bg-cream-light px-4 py-3 text-sm text-teal-deep outline-none focus:border-coral"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full rounded-full bg-teal-deep px-6 py-4 text-xs font-semibold tracking-[0.16em] uppercase text-cream transition hover:bg-coral hover:text-teal-deep"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ */}
        <section id="faq" className="mt-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-coral">
              FAQ
            </p>
            <h2 className="mt-3 font-editorial text-4xl font-medium text-teal-deep sm:text-5xl">
              Frequently asked questions.
            </h2>
          </div>

          <div className="mt-10 divide-y divide-teal-deep/10 rounded-[28px] border border-teal-deep/10 bg-white px-6 sm:px-8">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.question} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="font-editorial text-2xl font-medium text-teal-deep">
                      {faq.question}
                    </span>
                    <ChevronDownIcon
                      className={`w-5 h-5 text-coral shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-teal-deep/75">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
