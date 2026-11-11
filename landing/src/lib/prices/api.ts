import { REFERENCE_PRICES, type MaterialCode } from './catalog';
import { REFERENCE_LABOUR, type LabourCode } from './labour';
import type { LabourInfo, PriceBook, PriceInfo } from './price-book';

type PriceItemResponse = PriceInfo & { code: string; sources: (PriceInfo['sources'][number] & { storeCode: string })[] };

type PricesResponse = { generatedAt: string; items: PriceItemResponse[] };

type LabourItemResponse = { code: string; min: number; price: number; max: number; updatedAt: string };

type LabourResponse = { generatedAt: string; items: LabourItemResponse[] };

const isMaterialCode = (code: string): code is MaterialCode => code in REFERENCE_PRICES;

const isLabourCode = (code: string): code is LabourCode => code in REFERENCE_LABOUR;

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${url} responded with ${response.status}`);
  return (await response.json()) as T;
}

async function fetchMaterials(signal?: AbortSignal): Promise<PriceBook['materials']> {
  const { items } = await getJson<PricesResponse>('/api/prices', signal);
  const materials: PriceBook['materials'] = {};
  items.forEach(({ code, price, min, max, status, sampleSize, checkedAt, sources }) => {
    if (!isMaterialCode(code)) return;
    materials[code] = {
      price,
      min,
      max,
      status,
      sampleSize,
      checkedAt,
      sources: sources.map(({ storeName, url, unitPrice, observedAt }) => ({ storeName, url, unitPrice, observedAt })),
    };
  });
  return materials;
}

async function fetchLabour(signal?: AbortSignal): Promise<PriceBook['labour']> {
  const { items } = await getJson<LabourResponse>('/api/labour-rates', signal);
  const labour: PriceBook['labour'] = {};
  items.forEach(({ code, min, price, max, updatedAt }) => {
    if (isLabourCode(code)) labour[code] = { min, price, max, updatedAt } satisfies LabourInfo;
  });
  return labour;
}

export async function fetchPriceBook(signal?: AbortSignal): Promise<PriceBook> {
  const [materials, labour] = await Promise.allSettled([fetchMaterials(signal), fetchLabour(signal)]);
  if (materials.status === 'rejected' && labour.status === 'rejected') throw materials.reason;
  return {
    materials: materials.status === 'fulfilled' ? materials.value : {},
    labour: labour.status === 'fulfilled' ? labour.value : {},
  };
}

export async function sendPriceReport(report: { estimateId: string; materialCode?: string; comment?: string }) {
  const response = await fetch('/api/price-reports', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(report),
  });
  if (!response.ok) throw new Error(`Price report failed with ${response.status}`);
}
