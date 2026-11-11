import { ConflictException, Injectable } from '@nestjs/common';
import type { ObservationStatus } from '../generated/prisma/client.js';
import { PricesService } from '../prices/prices.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

type Resolution = Exclude<ObservationStatus, 'PENDING_REVIEW'>;

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prices: PricesService,
  ) {}

  list(status: ObservationStatus, take: number) {
    return this.prisma.priceObservation.findMany({
      where: { status },
      orderBy: { observedAt: 'desc' },
      take,
      include: {
        listing: {
          select: {
            url: true,
            packSize: true,
            material: { select: { code: true, name: true, unit: true, referencePrice: true } },
            store: { select: { code: true, name: true } },
          },
        },
      },
    });
  }

  approve(id: string) {
    return this.resolve(id, 'ACCEPTED');
  }

  reject(id: string, reason?: string) {
    return this.resolve(id, 'REJECTED', reason);
  }

  private async resolve(id: string, status: Resolution, reason?: string) {
    const { count } = await this.prisma.priceObservation.updateMany({
      where: { id, status: 'PENDING_REVIEW' },
      data: { status, reviewedAt: new Date(), ...(reason ? { reason } : {}) },
    });
    if (count === 0) throw new ConflictException('Observation is not pending review');
    this.prices.invalidate();
    return this.prisma.priceObservation.findUniqueOrThrow({ where: { id } });
  }
}
