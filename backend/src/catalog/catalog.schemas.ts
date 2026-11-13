import { z } from 'zod';
import { MaterialCategory, Quality } from '../generated/prisma/enums.js';

export const codeSchema = z.string().regex(/^[a-z0-9-]{2,64}$/, 'Use lowercase letters, digits and dashes');
export const idSchema = z.cuid();

const price = z.number().int().positive().max(1_000_000_000);

export const createMaterialSchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(2).max(160),
  unit: z.string().trim().min(1).max(20),
  category: z.enum(MaterialCategory),
  referencePrice: price,
});
export const updateMaterialSchema = createMaterialSchema.omit({ code: true }).partial();

export const createStoreSchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(2).max(120),
  baseUrl: z.url({ protocol: /^https$/ }),
  priceSelector: z.string().trim().min(1).max(200).nullable().optional(),
  crawlDelayMs: z.number().int().min(1000).max(60_000).optional(),
  active: z.boolean().optional(),
});
export const updateStoreSchema = createStoreSchema.omit({ code: true }).partial();

const label = (max: number) =>
  z
    .string()
    .trim()
    .transform((value) => value.replace(/\s+/g, ' '))
    .pipe(z.string().min(1).max(max));

export const createProductSchema = z.object({
  materialCode: codeSchema,
  brand: label(60),
  name: label(160),
  packSize: z.number().positive().max(10_000).default(1),
  tier: z.enum(Quality).nullable().optional(),
  imageUrl: z.url({ protocol: /^https$/ }).max(500).nullable().optional(),
});
export const updateProductSchema = createProductSchema.omit({ materialCode: true }).extend({ active: z.boolean() }).partial();

export const createListingSchema = z.object({
  materialCode: codeSchema,
  productId: idSchema.nullable().optional(),
  storeCode: codeSchema,
  url: z.url({ protocol: /^https$/ }),
  title: z.string().trim().max(200).optional(),
  packSize: z.number().positive().max(10_000).optional(),
});
export const updateListingSchema = z
  .object({
    url: z.url({ protocol: /^https$/ }),
    title: z.string().trim().max(200).nullable(),
    packSize: z.number().positive().max(10_000),
    active: z.boolean(),
    productId: idSchema.nullable(),
  })
  .partial();

export const listListingsQuerySchema = z.object({
  materialCode: codeSchema.optional(),
  storeCode: codeSchema.optional(),
  active: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
});

export const manualObservationSchema = z.object({ price });

export type CreateMaterial = z.infer<typeof createMaterialSchema>;
export type UpdateMaterial = z.infer<typeof updateMaterialSchema>;
export type CreateStore = z.infer<typeof createStoreSchema>;
export type UpdateStore = z.infer<typeof updateStoreSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type CreateListing = z.infer<typeof createListingSchema>;
export type UpdateListing = z.infer<typeof updateListingSchema>;
export type ListListingsQuery = z.infer<typeof listListingsQuerySchema>;
export type ManualObservation = z.infer<typeof manualObservationSchema>;
