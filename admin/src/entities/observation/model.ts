export type ObservationStatus = 'ACCEPTED' | 'PENDING_REVIEW' | 'REJECTED';

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

export type ReviewItem = Observation & {
  listing: {
    url: string;
    packSize: string;
    material: { code: string; name: string; unit: string; referencePrice: number };
    store: { code: string; name: string };
  };
};

export const STATUS_LABEL: Record<ObservationStatus, string> = {
  ACCEPTED: 'Qabul qilingan',
  PENDING_REVIEW: 'Tekshiruvda',
  REJECTED: 'Rad etilgan',
};
