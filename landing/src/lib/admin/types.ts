export type ObservationStatus = 'ACCEPTED' | 'PENDING_REVIEW' | 'REJECTED';
export type ScrapeOutcome = 'OK' | 'FAILED' | 'BLOCKED';
export type ReportStatus = 'OPEN' | 'RESOLVED' | 'DISMISSED';

export type AdminMaterial = {
  code: string;
  name: string;
  unit: string;
  category: string;
  referencePrice: number;
  _count: { listings: number };
};

export type ProductTier = 'eco' | 'mid' | 'pre';

export type AdminProduct = {
  id: string;
  brand: string;
  name: string;
  packSize: number;
  tier: ProductTier | null;
  imageUrl: string | null;
  active: boolean;
  listings: number;
  price: { min: number; max: number; sources: number } | null;
};

export type ProductInput = {
  brand: string;
  name: string;
  packSize: number;
  tier: ProductTier | null;
  imageUrl: string | null;
};

export type AdminStore = {
  code: string;
  name: string;
  baseUrl: string;
  active: boolean;
  crawlDelayMs: number;
  _count: { listings: number };
};

export type Observation = {
  id: string;
  listingId: string;
  price: number;
  unitPrice: number;
  status: ObservationStatus;
  source: 'SCRAPER' | 'MANUAL';
  reason: string | null;
  observedAt: string;
  reviewedAt: string | null;
};

export type AdminListing = {
  id: string;
  url: string;
  title: string | null;
  packSize: string;
  active: boolean;
  lastCheckedAt: string | null;
  lastOutcome: ScrapeOutcome | null;
  lastError: string | null;
  failureCount: number;
  material: { code: string; name: string; unit: string };
  store: { code: string; name: string };
  product: { id: string; brand: string; name: string } | null;
  observations: Observation[];
};

export type ReviewItem = Observation & {
  listing: {
    url: string;
    packSize: string;
    material: { code: string; name: string; unit: string; referencePrice: number };
    store: { code: string; name: string };
  };
};

export type LabourRate = {
  code: string;
  name: string;
  unit: string;
  minPrice: number;
  price: number;
  maxPrice: number;
  updatedAt: string;
};

export type ScrapeRun = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  total: number;
  accepted: number;
  flagged: number;
  failed: number;
  blocked: number;
};

export type PriceReport = {
  id: string;
  estimateId: string;
  materialCode: string | null;
  comment: string | null;
  status: ReportStatus;
  createdAt: string;
};

export type PreviewResult =
  | { outcome: 'OK'; price: number; title: string | null; strategy: string }
  | { outcome: 'FAILED' | 'BLOCKED'; error: string };

export type CheckResult =
  | { outcome: 'OK'; status: ObservationStatus; price: number; unitPrice: number; reason: string | null }
  | { outcome: 'FAILED' | 'BLOCKED'; error: string };

export type NewListing = { materialCode: string; storeCode: string; url: string; title?: string; packSize?: number; productId?: string | null };
