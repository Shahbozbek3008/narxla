import { Injectable, NotFoundException } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { buildQuote, type PriceQuote } from './domain/price-quote.js';

export type MaterialQuote = PriceQuote & {
  code: string;
  name: string;
  unit: string;
  category: string;
  referencePrice: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 60_000;

@Injectable()
export class PricesService {
  private cache: { value: MaterialQuote[]; expiresAt: number } | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async quotes(): Promise<MaterialQuote[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.value;
    const value = await this.load({});
    this.cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  }

  async quote(code: string): Promise<MaterialQuote> {
    const [quote] = await this.load({ code });
    if (!quote) throw new NotFoundException(`Material ${code} not found`);
    return quote;
  }

  async baselineFor(listingId: string, materialId: string) {
    const lastAccepted = await this.prisma.priceObservation.findFirst({
      where: { listingId, status: 'ACCEPTED' },
      orderBy: { observedAt: 'desc' },
      select: { unitPrice: true },
    });
    if (lastAccepted) return lastAccepted.unitPrice;

    const [quote] = await this.load({ id: materialId });
    return quote?.price ?? null;
  }

  invalidate() {
    this.cache = null;
  }

  private async load(where: Prisma.MaterialWhereInput): Promise<MaterialQuote[]> {
    const { freshDays, minSources } = this.config.pricing;
    const freshSince = new Date(Date.now() - freshDays * DAY_MS);

    const materials = await this.prisma.material.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        listings: {
          where: { active: true, store: { active: true } },
          include: {
            store: { select: { code: true, name: true } },
            observations: {
              where: { status: 'ACCEPTED', observedAt: { gte: freshSince } },
              orderBy: { observedAt: 'desc' },
              take: 1,
              select: { unitPrice: true, observedAt: true },
            },
          },
        },
      },
    });

    return materials.map(({ listings, code, name, unit, category, referencePrice }) => {
      const sources = listings.flatMap(({ store, url, observations: [latest] }) =>
        latest ? [{ storeCode: store.code, storeName: store.name, url, unitPrice: latest.unitPrice, observedAt: latest.observedAt }] : [],
      );
      return { code, name, unit, category, referencePrice, ...buildQuote(referencePrice, sources, minSources) };
    });
  }
}
