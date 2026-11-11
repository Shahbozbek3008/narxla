import { z } from 'zod';
import { codeSchema } from '../catalog/catalog.schemas.js';

const price = z.number().int().positive().max(1_000_000_000);

const rateFields = z.object({
  name: z.string().trim().min(2).max(160),
  unit: z.string().trim().min(1).max(20),
  minPrice: price,
  price,
  maxPrice: price,
});

const isOrdered = ({ minPrice, price, maxPrice }: { minPrice?: number; price?: number; maxPrice?: number }) =>
  (minPrice === undefined || price === undefined || minPrice <= price) &&
  (price === undefined || maxPrice === undefined || price <= maxPrice) &&
  (minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice);

const orderMessage = { message: 'Expected minPrice ≤ price ≤ maxPrice', path: ['price'] };

export const createLabourRateSchema = rateFields.extend({ code: codeSchema }).refine(isOrdered, orderMessage);
export const updateLabourRateSchema = rateFields.partial().refine(isOrdered, orderMessage);

export type CreateLabourRate = z.infer<typeof createLabourRateSchema>;
export type UpdateLabourRate = z.infer<typeof updateLabourRateSchema>;
