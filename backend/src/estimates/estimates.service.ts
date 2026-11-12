import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { ApiError } from '../common/api-error.js';
import type { Estimate } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { estimateLimit } from '../users/domain/plan.js';
import { UsersService } from '../users/users.service.js';
import type { CreateEstimate, UpdateEstimate } from './estimates.schemas.js';

const SHARE_TOKEN_BYTES = 18;

const toDto = ({ id, name, input, status, shareToken, createdAt, updatedAt }: Estimate) => ({
  id,
  name,
  input,
  status,
  shareToken,
  createdAt,
  updatedAt,
});

@Injectable()
export class EstimatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
  ) {}

  async list(userId: string) {
    const estimates = await this.prisma.estimate.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return estimates.map(toDto);
  }

  async get(userId: string, id: string) {
    return toDto(await this.owned(userId, id));
  }

  async create(userId: string, data: CreateEstimate) {
    const limit = estimateLimit(await this.users.planOf(userId));
    if (limit !== null && (await this.prisma.estimate.count({ where: { userId } })) >= limit) {
      throw new ApiError(HttpStatus.FORBIDDEN, 'PLAN_LIMIT', `The free plan allows up to ${limit} estimates`, { limit });
    }
    return toDto(await this.prisma.estimate.create({ data: { userId, ...data } }));
  }

  async update(userId: string, id: string, data: UpdateEstimate) {
    await this.owned(userId, id);
    return toDto(await this.prisma.estimate.update({ where: { id }, data }));
  }

  async remove(userId: string, id: string) {
    const { count } = await this.prisma.estimate.deleteMany({ where: { id, userId } });
    if (count === 0) throw new NotFoundException('Estimate not found');
  }

  async share(userId: string, id: string) {
    const estimate = await this.owned(userId, id);
    if (estimate.shareToken) return toDto(estimate);
    return toDto(
      await this.prisma.estimate.update({
        where: { id },
        data: { shareToken: randomBytes(SHARE_TOKEN_BYTES).toString('base64url'), sharedAt: new Date() },
      }),
    );
  }

  async unshare(userId: string, id: string) {
    await this.owned(userId, id);
    return toDto(await this.prisma.estimate.update({ where: { id }, data: { shareToken: null, sharedAt: null } }));
  }

  async shared(token: string) {
    const estimate = await this.prisma.estimate.findUnique({ where: { shareToken: token } });
    if (!estimate) throw new NotFoundException('Shared estimate not found');
    const { id, name, input, createdAt } = estimate;
    return { id, name, input, createdAt };
  }

  private async owned(userId: string, id: string) {
    const estimate = await this.prisma.estimate.findFirst({ where: { id, userId } });
    if (!estimate) throw new NotFoundException('Estimate not found');
    return estimate;
  }
}
