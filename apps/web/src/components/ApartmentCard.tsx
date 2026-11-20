import Link from 'next/link';
import { Apartment, formatGhs } from '@/lib/data';
import { ArrowUpRightIcon, BathIcon, BedIcon, UsersIcon } from './icons';

interface ApartmentCardProps {
  apartment: Apartment;
  queryString?: string;
}

export function ApartmentCard({
  apartment,
  queryString = '',
}: ApartmentCardProps) {
  const detailHref = `/apartments/${apartment.slug}${queryString ? `?${queryString}` : ''}`;

  return (
    <Link
      href={detailHref}
      className="group flex flex-col overflow-hidden rounded-[28px] border border-teal-deep/10 bg-white transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_70px_-24px_rgba(0,43,53,0.22)]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-teal-deep">
        <img
          src={apartment.heroImage}
          alt={apartment.name}
          className="luxury-image h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-teal-deep/70 via-teal-deep/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute left-5 top-5 flex items-center gap-2">
          <span className="rounded-full bg-teal-deep/85 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase text-cream backdrop-blur-md">
            {apartment.unitPosition}
          </span>
        </div>

        {/* Bottom price pill */}
        <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-cream/75">
              Starting from
            </p>
            <p className="font-editorial text-2xl font-semibold text-cream">
              {formatGhs(apartment.nightlyRateGhs)}
              <span className="font-sans text-xs font-normal text-cream/80">
                {' '}
                / night
              </span>
            </p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-coral text-teal-deep transition-transform duration-300 group-hover:scale-110 group-hover:bg-cream">
            <ArrowUpRightIcon className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-7">
        <div>
          <h3 className="font-editorial text-3xl font-semibold text-teal-deep transition-colors group-hover:text-coral">
            {apartment.name}
          </h3>
          <p className="mt-2.5 text-sm leading-relaxed text-teal-deep/70">
            {apartment.shortDescription}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-teal-deep/10 pt-5 text-xs font-medium text-teal-deep/80">
          <span className="inline-flex items-center gap-1.5">
            <BedIcon className="w-4 h-4 text-coral" />
            {apartment.bedrooms}{' '}
            {apartment.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BathIcon className="w-4 h-4 text-coral" />
            {apartment.bathrooms} {apartment.bathrooms === 1 ? 'Bath' : 'Baths'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="w-4 h-4 text-coral" />
            Up to {apartment.maxGuests} Guests
          </span>
        </div>
      </div>
    </Link>
  );
}
