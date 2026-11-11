import { REFERENCE_PRICES, type MaterialCode } from './catalog';
import type { PriceBook, PriceInfo } from './price-book';

type PriceItemResponse = PriceInfo & { code: string; sources: (PriceInfo['sources'][number] & { storeCode: string })[] };

type PricesResponse = { generatedAt: string; items: PriceItemResponse[] };

export const PRICES_ENDPOINT = '/api/prices';

const isMaterialCode = (code: string): code is MaterialCode => code in REFERENCE_PRICES;

export async function fetchPriceBook(signal?: AbortSignal): Promise<PriceBook> {
  const response = await fetch(PRICES_ENDPOINT, { signal, headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`Prices request failed with ${response.status}`);

  const { items } = (await response.json()) as PricesResponse;
  const book: PriceBook = {};
  items.forEach(({ code, price, min, max, status, sampleSize, checkedAt, sources }) => {
    if (!isMaterialCode(code)) return;
    book[code] = {
      price,
      min,
      max,
      status,
      sampleSize,
      checkedAt,
      sources: sources.map(({ storeName, url, unitPrice, observedAt }) => ({ storeName, url, unitPrice, observedAt })),
    };
  });
  return book;
}

export async function sendPriceReport(report: { estimateId: string; materialCode?: string; comment?: string }) {
  const response = await fetch('/api/price-reports', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (!response.ok) throw new Error(`Price report failed with ${response.status}`);
}
