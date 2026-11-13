export type ProductTier = 'eco' | 'mid' | 'pre';

export type Product = {
  id: string;
  brand: string;
  name: string;
  packSize: number;
  tier: ProductTier | null;
  imageUrl: string | null;
  active: boolean;
  listings: number;
  price: { min: number; max: number; sources: number } | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductInput = {
  brand: string;
  name: string;
  packSize: number;
  tier: ProductTier | null;
  imageUrl: string | null;
};

export const TIERS: ProductTier[] = ['eco', 'mid', 'pre'];

export const TIER_LABEL: Record<ProductTier, string> = { eco: 'Tejamkor', mid: 'O‘rta', pre: 'Premium' };
