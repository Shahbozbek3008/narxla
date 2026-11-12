'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { estimate } from '@/lib/calc-engine';
import { dec, rangeMln } from '@/lib/format';
import type { EstimateRecord, EstimateStatus } from '@/lib/api/types';
import { usePriceBook } from '@/store/prices';
import { useFormatDate } from '../common/useFormatDate';

export type ProjectRow = {
  id: string;
  name: string;
  status: EstimateStatus;
  area: string;
  quality: string;
  date: string;
  range: string;
  ratio: number;
};

export function useProjectRows(projects: EstimateRecord[]): ProjectRow[] {
  const t = useTranslations('app');
  const formatDate = useFormatDate();
  const book = usePriceBook();

  return useMemo(
    () =>
      projects.map((project) => {
        const { L, W, quality } = project.input;
        const result = estimate(project.input, book);
        return {
          id: project.id,
          name: project.name,
          status: project.status,
          area: `${dec(result.area)} m²`,
          quality: t(`qualities.${quality}.name`),
          date: formatDate(project.createdAt.slice(0, 10)),
          range: t('mln', { value: rangeMln(result.low, result.high) }),
          ratio: Math.max(L, W) / Math.max(Math.min(L, W), 0.1),
        };
      }),
    [projects, t, formatDate, book],
  );
}
