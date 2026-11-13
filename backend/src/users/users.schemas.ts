import { z } from 'zod';
import { Plan, Quality } from '../generated/prisma/enums.js';

export const RESERVE_OPTIONS = [5, 10, 15] as const;

const label = (max: number) => z.string().trim().max(max);

export const updateProfileSchema = z
  .object({
    name: label(80),
    region: label(60).min(1),
    district: label(60),
    reserve: z.union(RESERVE_OPTIONS.map((value) => z.literal(value))),
    quality: z.enum(Quality),
    notifyPrice: z.boolean(),
    notifyTelegram: z.boolean(),
    notifyNews: z.boolean(),
  })
  .partial()
  .strict();

export const listUsersQuerySchema = z.object({
  query: z.string().trim().max(80).optional(),
  take: z.coerce.number().int().min(1).max(200).default(50),
});

export const grantPlanSchema = z.object({
  plan: z.enum([Plan.project, Plan.pro]),
  amount: z.number().int().nonnegative().max(100_000_000).optional(),
  reference: z.string().trim().max(120).optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type GrantPlan = z.infer<typeof grantPlanSchema>;

export const mergeUsersSchema = z.object({ sourceId: z.cuid() });
export type MergeUsers = z.infer<typeof mergeUsersSchema>;
