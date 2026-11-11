import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateReport, ListReportsQuery, UpdateReport } from './reports.schemas.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReport) {
    const report = await this.prisma.priceReport.create({ data, select: { id: true, createdAt: true } });
    return { id: report.id, receivedAt: report.createdAt };
  }

  list({ status, take }: ListReportsQuery) {
    return this.prisma.priceReport.findMany({ where: { status }, orderBy: { createdAt: 'desc' }, take });
  }

  update(id: string, { status }: UpdateReport) {
    return this.prisma.priceReport.update({ where: { id }, data: { status, resolvedAt: new Date() } });
  }
}
