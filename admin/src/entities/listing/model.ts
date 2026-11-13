import type { Observation } from '@/entities/observation';

export type ScrapeOutcome = 'OK' | 'FAILED' | 'BLOCKED';

export type Listing = {
  id: string;
  url: string;
  title: string | null;
  packSize: string;
  active: boolean;
  productId: string | null;
  lastCheckedAt: string | null;
  lastOutcome: ScrapeOutcome | null;
  lastError: string | null;
  failureCount: number;
  material: { code: string; name: string; unit: string };
  store: { code: string; name: string };
  product: { id: string; brand: string; name: string } | null;
  observations: Observation[];
};
