import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { MATERIALS } from './seed/materials.js';
import { STORES } from './seed/stores.js';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function seed() {
  for (const { code, referencePrice, ...details } of MATERIALS) {
    await prisma.material.upsert({
      where: { code },
      create: { code, referencePrice, ...details },
      update: details,
    });
  }

  for (const { code, ...details } of STORES) {
    await prisma.store.upsert({ where: { code }, create: { code, ...details }, update: details });
  }

  console.info(`Seeded ${MATERIALS.length} materials and ${STORES.length} stores`);
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
