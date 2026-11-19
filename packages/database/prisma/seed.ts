import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';

export const initialApartments = [
  {
    code: 'SIRIUS',
    name: 'The Sirius Residence',
    slug: 'the-sirius-residence',
    bedrooms: 2,
    locationDescription: 'Middle floor',
  },
  {
    code: 'EMERALD',
    name: 'The Emerald Residence',
    slug: 'the-emerald-residence',
    bedrooms: 2,
    locationDescription: 'Ground floor',
  },
  {
    code: 'EOS',
    name: 'The Eos Suite',
    slug: 'the-eos-suite',
    bedrooms: 1,
    locationDescription: 'Front apartment',
  },
  {
    code: 'APOLLO',
    name: 'The Apollo Suite',
    slug: 'the-apollo-suite',
    bedrooms: 1,
    locationDescription: 'Corridor apartment',
  },
] as const;

export async function seedApartments(client: PrismaClient): Promise<void> {
  for (const apartment of initialApartments) {
    await client.apartment.upsert({
      where: { code: apartment.code },
      create: apartment,
      update: {},
    });
  }
}

if (process.argv[1]?.endsWith('seed.ts')) {
  if (process.env.NODE_ENV === 'production')
    throw new Error('Seeding is disabled in production');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error('DATABASE_URL is required for seeding');
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  try {
    await seedApartments(client);
    console.log('Initial apartment seed complete');
  } finally {
    await client.$disconnect();
  }
}
