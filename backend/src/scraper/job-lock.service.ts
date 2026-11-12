import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class JobLockService {
  private readonly owner = randomUUID();

  constructor(private readonly prisma: PrismaService) {}

  async acquire(name: string, leaseMs: number) {
    const lockedUntil = new Date(Date.now() + leaseMs);
    const rows = await this.prisma.$queryRaw<{ owner: string }[]>`
      INSERT INTO job_locks (name, owner, "lockedUntil")
      VALUES (${name}, ${this.owner}, ${lockedUntil})
      ON CONFLICT (name) DO UPDATE
        SET owner = EXCLUDED.owner, "lockedUntil" = EXCLUDED."lockedUntil"
        WHERE job_locks."lockedUntil" < now() OR job_locks.owner = EXCLUDED.owner
      RETURNING owner`;
    return rows.length > 0;
  }

  async renew(name: string, leaseMs: number) {
    const { count } = await this.prisma.jobLock.updateMany({
      where: { name, owner: this.owner },
      data: { lockedUntil: new Date(Date.now() + leaseMs) },
    });
    return count > 0;
  }

  async release(name: string) {
    await this.prisma.jobLock.deleteMany({ where: { name, owner: this.owner } });
  }
}
