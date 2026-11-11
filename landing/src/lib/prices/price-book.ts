import { REFERENCE_PRICES, type MaterialCode } from './catalog';

export type PriceStatus = 'verified' | 'partial' | 'estimated';

export type PriceSource = {
  storeName: string;
  url: string;
  unitPrice: number;
  observedAt: string;
};

export type PriceInfo = {
  price: number;
  min: number;
  max: number;
  status: PriceStatus;
  sampleSize: number;
  checkedAt: string | null;
  sources: PriceSource[];
};

export type PriceBook = Partial<Record<MaterialCode, PriceInfo>>;

export type PriceLookup = (code: MaterialCode) => number;

const referenceInfo = (code: MaterialCode): PriceInfo => {
  const price = REFERENCE_PRICES[code];
  return { price, min: price, max: price, status: 'estimated', sampleSize: 0, checkedAt: null, sources: [] };
};

export const priceInfo = (book: PriceBook, code: MaterialCode): PriceInfo => book[code] ?? referenceInfo(code);

export const priceOf = (book: PriceBook, code: MaterialCode) => priceInfo(book, code).price;

export function combineStatus(statuses: PriceStatus[]): PriceStatus {
  if (statuses.length === 0) return 'estimated';
  if (statuses.every((status) => status === 'verified')) return 'verified';
  if (statuses.every((status) => status === 'estimated')) return 'estimated';
  return 'partial';
}

export function trackedLookup(book: PriceBook) {
  const used = new Set<MaterialCode>();
  const lookup: PriceLookup = (code) => {
    used.add(code);
    return priceOf(book, code);
  };
  return { lookup, used };
}
