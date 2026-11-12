'use client';

import { useTranslations } from 'next-intl';
import { isApiError } from '@/lib/api/client';
import { useAuth, useEstimateRecord } from '@/lib/api/queries';
import type { EstimateRecord } from '@/lib/api/types';
import type { EstimateInput } from '@/lib/calc-engine';
import { DEMO_ESTIMATE_ID, DRAFT_ESTIMATE_ID } from '@/lib/routes';
import { DEMO_INPUT, draftToInput, useDraft } from '@/store/draft';
import { useHydrated } from '@/store/StoreHydrator';

export type ResolvedEstimate =
  | { state: 'loading' }
  | { state: 'missing' }
  | { state: 'error'; retry: () => void }
  | { state: 'ready'; input: EstimateInput; name: string; project: EstimateRecord | null };

const NOT_FOUND = 404;

export function useResolvedEstimate(id: string): ResolvedEstimate {
  const t = useTranslations('app.rooms');
  const hydrated = useHydrated();
  const draft = useDraft();
  const { status } = useAuth();
  const local = id === DEMO_ESTIMATE_ID || id === DRAFT_ESTIMATE_ID;
  const record = useEstimateRecord(id, !local && status === 'authenticated');

  if (local) {
    if (!hydrated) return { state: 'loading' };
    const input = id === DEMO_ESTIMATE_ID ? DEMO_INPUT : draftToInput(draft);
    return { state: 'ready', input, name: t(`${input.room}.name`), project: null };
  }

  if (status === 'guest') return { state: 'missing' };
  if (record.data) return { state: 'ready', input: record.data.input, name: record.data.name, project: record.data };
  if (record.isError) {
    return isApiError(record.error) && record.error.status === NOT_FOUND
      ? { state: 'missing' }
      : { state: 'error', retry: () => void record.refetch() };
  }
  return { state: 'loading' };
}
