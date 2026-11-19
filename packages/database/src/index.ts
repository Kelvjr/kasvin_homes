import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client/client.js';
export { ApartmentStatus, Prisma } from '../generated/client/client.js';
export type {
  PrismaClient,
  Apartment,
  Amenity,
  ApartmentImage,
  ApartmentAmenity,
} from '../generated/client/client.js';

let client: PrismaClient | undefined;

export function getDatabaseClient(connectionString: string): PrismaClient {
  if (!client) {
    const adapter = new PrismaPg({ connectionString });
    client = new PrismaClient({ adapter });
  }
  return client;
}

export async function checkDatabaseConnection(
  connectionString: string,
): Promise<void> {
  await getDatabaseClient(connectionString).$queryRaw`SELECT 1`;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.$disconnect();
    client = undefined;
  }
}
