import { BadRequestException, Injectable } from '@nestjs/common';
import { hostOf, sameHost } from '../common/url.js';
import { PricesService } from '../prices/prices.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { unitPriceOf } from '../scraper/domain/observation-policy.js';
import type {
  CreateListing,
  CreateMaterial,
  CreateStore,
  ListListingsQuery,
  ManualObservation,
  UpdateListing,
  UpdateMaterial,
  UpdateStore,
} from './catalog.schemas.js';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prices: PricesService,
  ) {}

  listMaterials() {
    return this.prisma.material.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
      include: { _count: { select: { listings: { where: { active: true } } } } },
    });
  }

  async createMaterial(data: CreateMaterial) {
    const material = await this.prisma.material.create({ data });
    this.prices.invalidate();
    return material;
  }

  async updateMaterial(code: string, data: UpdateMaterial) {
    const material = await this.prisma.material.update({ where: { code }, data });
    this.prices.invalidate();
    return material;
  }

  listStores() {
    return this.prisma.store.findMany({
      orderBy: { code: 'asc' },
      include: { _count: { select: { listings: { where: { active: true } } } } },
    });
  }

  createStore(data: CreateStore) {
    return this.prisma.store.create({ data });
  }

  async updateStore(code: string, data: UpdateStore) {
    const store = await this.prisma.store.update({ where: { code }, data });
    this.prices.invalidate();
    return store;
  }

  listListings({ materialCode, storeCode, active }: ListListingsQuery) {
    return this.prisma.listing.findMany({
      where: { active, material: { code: materialCode }, store: { code: storeCode } },
      orderBy: { createdAt: 'desc' },
      include: {
        material: { select: { code: true, name: true, unit: true } },
        store: { select: { code: true, name: true } },
        observations: { orderBy: { observedAt: 'desc' }, take: 1 },
      },
    });
  }

  async createListing({ materialCode, storeCode, ...data }: CreateListing) {
    const store = await this.prisma.store.findUniqueOrThrow({ where: { code: storeCode } });
    this.assertSameHost(data.url, store.baseUrl);
    return this.prisma.listing.create({
      data: { ...data, store: { connect: { id: store.id } }, material: { connect: { code: materialCode } } },
    });
  }

  async updateListing(id: string, data: UpdateListing) {
    if (data.url) {
      const { store } = await this.prisma.listing.findUniqueOrThrow({ where: { id }, select: { store: true } });
      this.assertSameHost(data.url, store.baseUrl);
    }
    const listing = await this.prisma.listing.update({
      where: { id },
      data: data.active ? { ...data, failureCount: 0 } : data,
    });
    this.prices.invalidate();
    return listing;
  }

  async deleteListing(id: string) {
    await this.prisma.listing.delete({ where: { id } });
    this.prices.invalidate();
  }

  async recordManualPrice(listingId: string, { price }: ManualObservation) {
    const listing = await this.prisma.listing.findUniqueOrThrow({ where: { id: listingId }, select: { packSize: true } });
    const observation = await this.prisma.priceObservation.create({
      data: {
        listingId,
        price,
        unitPrice: unitPriceOf(price, listing.packSize.toNumber()),
        status: 'ACCEPTED',
        source: 'MANUAL',
        reviewedAt: new Date(),
      },
    });
    this.prices.invalidate();
    return observation;
  }

  private assertSameHost(url: string, baseUrl: string) {
    if (!sameHost(url, baseUrl)) throw new BadRequestException(`URL must belong to ${hostOf(baseUrl)}`);
  }
}
