'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRightIcon, CloseIcon, MenuIcon } from './icons';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/apartments', label: 'Apartments' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const solidNav = scrolled || !isHome || mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solidNav
          ? 'bg-teal-deep/95 backdrop-blur-md shadow-[0_12px_40px_-16px_rgba(0,43,53,0.45)] border-b border-cream/10'
          : 'bg-gradient-to-b from-teal-deep/75 via-teal-deep/35 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3 focus:outline-none"
          aria-label="Kasvin Homes Home"
        >
          <img
            src="/brand/logo-wordmark.png"
            alt="Kasvin Homes"
            className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </Link>

        {/* Desktop Nav */}
        <nav
          className="hidden items-center gap-9 md:flex"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-[13px] font-medium tracking-[0.14em] uppercase transition-colors duration-300 ${
                  active ? 'text-coral' : 'text-cream/85 hover:text-cream'
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-2 left-0 h-[1.5px] w-full bg-coral" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/book"
            className="group inline-flex items-center gap-2 rounded-full bg-coral px-6 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep transition-all duration-300 hover:bg-cream hover:text-teal-deep shadow-lg shadow-coral/20"
          >
            <span>Book Now</span>
            <ArrowUpRightIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-cream/20 p-2.5 text-cream transition hover:border-coral hover:text-coral md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <CloseIcon className="w-5 h-5" />
          ) : (
            <MenuIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`overflow-hidden transition-all duration-500 md:hidden ${
          mobileOpen
            ? 'max-h-[480px] border-t border-cream/10 bg-teal-deep'
            : 'max-h-0'
        }`}
      >
        <div className="flex flex-col gap-2 px-6 py-6">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium tracking-[0.12em] uppercase transition ${
                  active
                    ? 'bg-cream/10 text-coral'
                    : 'text-cream/85 hover:bg-cream/5 hover:text-cream'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/book"
            onClick={() => setMobileOpen(false)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase text-teal-deep"
          >
            <span>Book Your Stay</span>
            <ArrowUpRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
