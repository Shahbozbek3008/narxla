'use client';

import { useEffect, useMemo } from 'react';
import { checkPrice, estimate, WORK_IDS, type WorkId } from '@/lib/calc-engine';
import type { LabourCode } from '@/lib/prices/labour';
import { labourInfo } from '@/lib/prices/price-book';
import { DEMO_INPUT } from '@/store/draft';
import { usePriceBook, usePrices } from '@/store/prices';

const TOP_MATERIALS = 5;

export const DEMO_CHECK: { code: LabourCode; volume: number; quote: number } = {
  code: 'floor-tiling',
  volume: 52,
  quote: 4_900_000,
};

export type BreakdownSlice = { id: WorkId; share: number; from: number; to: number };

export function useDemoShot() {
  const book = usePriceBook();

  useEffect(() => {
    void usePrices.getState().load();
  }, []);

  return useMemo(() => {
    const result = estimate(DEMO_INPUT, book);
    const topMaterials = [...result.mats].sort((a, b) => b.total - a.total).slice(0, TOP_MATERIALS);

    let cursor = 0;
    const breakdown: BreakdownSlice[] = WORK_IDS.flatMap((id) => {
      const amount = result.byCat[id] ?? 0;
      if (amount <= 0) return [];
      const share = (amount / result.total) * 100;
      const slice = { id, share, from: cursor, to: cursor + share };
      cursor += share;
      return [slice];
    });

    const check = checkPrice(labourInfo(book, DEMO_CHECK.code), DEMO_CHECK.volume, DEMO_CHECK.quote);
    const delta = Math.round(((DEMO_CHECK.quote - check.avg) / check.avg) * 100);

    return { input: DEMO_INPUT, result, topMaterials, breakdown, check, delta };
  }, [book]);
}
