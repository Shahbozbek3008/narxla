export type PriceStatus = 'verified' | 'partial' | 'estimated';

export type SourcePrice = {
  storeCode: string;
  storeName: string;
  url: string;
  unitPrice: number;
  observedAt: Date;
};

export type PriceQuote = {
  price: number;
  min: number;
  max: number;
  status: PriceStatus;
  sampleSize: number;
  checkedAt: Date | null;
  sources: SourcePrice[];
};

const ROUNDING = 100;

const roundPrice = (value: number) => Math.round(value / ROUNDING) * ROUNDING;

export function median(values: number[]) {
  if (values.length === 0) throw new Error('Cannot compute the median of an empty list');
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function buildQuote(referencePrice: number, sources: SourcePrice[], minSources: number): PriceQuote {
  if (sources.length === 0) {
    return { price: referencePrice, min: referencePrice, max: referencePrice, status: 'estimated', sampleSize: 0, checkedAt: null, sources };
  }

  const prices = sources.map((source) => source.unitPrice);
  const checkedAt = new Date(Math.max(...sources.map((source) => source.observedAt.getTime())));

  return {
    price: roundPrice(median(prices)),
    min: Math.min(...prices),
    max: Math.max(...prices),
    status: sources.length >= minSources ? 'verified' : 'partial',
    sampleSize: sources.length,
    checkedAt,
    sources: [...sources].sort((a, b) => a.unitPrice - b.unitPrice),
  };
}
