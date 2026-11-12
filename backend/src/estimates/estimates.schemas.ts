import { z } from 'zod';
import { EstimateStatus, Quality } from '../generated/prisma/enums.js';
import { RESERVE_OPTIONS } from '../users/users.schemas.js';

export const ROOM_IDS = ['yotoq', 'mehmon', 'oshxona', 'hammom', 'koridor', 'bolalar'] as const;
export const WORK_IDS = ['pol', 'devor', 'shift', 'elektr', 'santex'] as const;

const metres = (min: number, max: number) => z.number().min(min).max(max);

export const estimateInputSchema = z
  .object({
    room: z.enum(ROOM_IDS),
    L: metres(0.5, 50),
    W: metres(0.5, 50),
    H: metres(1.5, 6),
    doors: z.number().int().min(0).max(10),
    windows: z.number().int().min(0).max(10),
    works: z.object(Object.fromEntries(WORK_IDS.map((id) => [id, z.boolean()])) as Record<(typeof WORK_IDS)[number], z.ZodBoolean>).strict(),
    quality: z.enum(Quality),
    reserve: z.union(RESERVE_OPTIONS.map((value) => z.literal(value))).optional(),
  })
  .strict()
  .refine(({ works }) => Object.values(works).some(Boolean), { message: 'Select at least one type of work', path: ['works'] });

const nameSchema = z.string().trim().min(1).max(120);

export const createEstimateSchema = z.object({ name: nameSchema, input: estimateInputSchema }).strict();

export const updateEstimateSchema = z
  .object({ name: nameSchema, input: estimateInputSchema, status: z.enum(EstimateStatus) })
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, { message: 'Nothing to update' });

export const shareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{16,64}$/);

export type EstimateInput = z.infer<typeof estimateInputSchema>;
export type CreateEstimate = z.infer<typeof createEstimateSchema>;
export type UpdateEstimate = z.infer<typeof updateEstimateSchema>;
