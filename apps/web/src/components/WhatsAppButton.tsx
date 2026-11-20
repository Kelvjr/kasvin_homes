'use client';

import { WhatsAppIcon } from './icons';

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/233200000000?text=Hello%20Kasvin%20Homes%2C%20I%20would%20like%20to%20enquire%20about%20booking%20an%20apartment."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Kasvin Homes on WhatsApp"
      className="group fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-teal-deep border border-cream/20 px-4 py-3 text-cream shadow-2xl shadow-teal-deep/40 transition-all duration-300 hover:bg-coral hover:text-teal-deep hover:border-coral hover:-translate-y-0.5"
    >
      <WhatsAppIcon className="w-5 h-5" />
      <span className="hidden text-xs font-semibold tracking-[0.12em] uppercase sm:inline">
        Concierge
      </span>
    </a>
  );
}
