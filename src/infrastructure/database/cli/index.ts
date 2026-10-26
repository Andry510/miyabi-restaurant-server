import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@generated/prisma/client';

//Infrastructure
import { Env } from '../../config';

const adapter = new PrismaPg(
  { connectionString: Env.DATABASE_URL },
  { schema: 'restaurant' },
);

const prisma = new PrismaClient({ adapter, log: ['error', 'warn'] });

export { prisma };
