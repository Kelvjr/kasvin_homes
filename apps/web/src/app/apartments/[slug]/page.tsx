import { notFound } from 'next/navigation';
import { APARTMENTS, getApartmentBySlug } from '@/lib/data';
import { ApartmentDetailClient } from './ApartmentDetailClient';

export function generateStaticParams() {
  return APARTMENTS.map((apt) => ({ slug: apt.slug }));
}

export default async function ApartmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const apartment = getApartmentBySlug(slug);

  if (!apartment) {
    notFound();
  }

  return <ApartmentDetailClient apartment={apartment} />;
}
