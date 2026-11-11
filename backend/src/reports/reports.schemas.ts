import { z } from 'zod';
import { ReportStatus } from '../generated/prisma/enums.js';

export const createReportSchema = z.object({
  estimateId: z.string().trim().min(1).max(64),
  materialCode: z.string().regex(/^[a-z0-9-]{2,64}$/).optional(),
  comment: z.string().trim().max(500).optional(),
});

export const listReportsQuerySchema = z.object({
  status: z.enum(ReportStatus).default('OPEN'),
  take: z.coerce.number().int().min(1).max(200).default(50),
});

export const updateReportSchema = z.object({
  status: z.enum([ReportStatus.RESOLVED, ReportStatus.DISMISSED]),
});

export type CreateReport = z.infer<typeof createReportSchema>;
export type ListReportsQuery = z.infer<typeof listReportsQuerySchema>;
export type UpdateReport = z.infer<typeof updateReportSchema>;
