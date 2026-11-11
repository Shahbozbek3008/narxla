import { REFERENCE_PRICES, type MaterialCode } from './catalog';
import { REFERENCE_LABOUR, type LabourCode, type LabourRange } from './labour';

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

export type LabourInfo = LabourRange & { updatedAt: string | null };

export type PriceBook = {
  materials: Partial<Record<MaterialCode, PriceInfo>>;
  labour: Partial<Record<LabourCode, LabourInfo>>;
};

export const EMPTY_BOOK: PriceBook = { materials: {}, labour: {} };

export type PriceLookup = (code: MaterialCode) => number;

const referenceInfo = (code: MaterialCode): PriceInfo => {
  const price = REFERENCE_PRICES[code];
  return { price, min: price, max: price, status: 'estimated', sampleSize: 0, checkedAt: null, sources: [] };
};

export const priceInfo = (book: PriceBook, code: MaterialCode): PriceInfo => book.materials[code] ?? referenceInfo(code);

export const priceOf = (book: PriceBook, code: MaterialCode) => priceInfo(book, code).price;

export const labourInfo = (book: PriceBook, code: LabourCode): LabourInfo =>
  book.labour[code] ?? { ...REFERENCE_LABOUR[code], updatedAt: null };

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
