import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { LABOUR_RATES } from './seed/labour-rates.js';
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

  for (const { code, minPrice, price, maxPrice, ...details } of LABOUR_RATES) {
    await prisma.labourRate.upsert({
      where: { code },
      create: { code, minPrice, price, maxPrice, ...details },
      update: details,
    });
  }

  console.info(`Seeded ${MATERIALS.length} materials, ${STORES.length} stores and ${LABOUR_RATES.length} labour rates`);
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
