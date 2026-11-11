import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateLabourRate, UpdateLabourRate } from './labour.schemas.js';

const PUBLIC_FIELDS = { code: true, name: true, unit: true, minPrice: true, price: true, maxPrice: true, updatedAt: true } as const;
const CACHE_TTL_MS = 60_000;

type PublicRate = { code: string; name: string; unit: string; min: number; price: number; max: number; updatedAt: Date };

@Injectable()
export class LabourService {
  private cache: { value: PublicRate[]; expiresAt: number } | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async rates(): Promise<PublicRate[]> {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.value;
    const rows = await this.prisma.labourRate.findMany({ orderBy: { code: 'asc' }, select: PUBLIC_FIELDS });
    const value = rows.map(({ minPrice, maxPrice, ...rate }) => ({ ...rate, min: minPrice, max: maxPrice }));
    this.cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
    return value;
  }

  list() {
    return this.prisma.labourRate.findMany({ orderBy: { code: 'asc' } });
  }

  async create(data: CreateLabourRate) {
    const rate = await this.prisma.labourRate.create({ data });
    this.cache = null;
    return rate;
  }

  async update(code: string, data: UpdateLabourRate) {
    const current = await this.prisma.labourRate.findUniqueOrThrow({ where: { code } });
    const next = { ...current, ...data };
    if (next.minPrice > next.price || next.price > next.maxPrice) {
      throw new BadRequestException('Expected minPrice ≤ price ≤ maxPrice');
    }
    const rate = await this.prisma.labourRate.update({ where: { code }, data });
    this.cache = null;
    return rate;
  }
}
