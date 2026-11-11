'use client';

import { useTranslations } from 'next-intl';
import type { EstimateInput } from '@/lib/calc-engine';
import { DEMO_ESTIMATE_ID, DRAFT_ESTIMATE_ID } from '@/lib/routes';
import { DEMO_INPUT, draftToInput, useDraft } from '@/store/draft';
import { findProject, useEstimates, type Project } from '@/store/estimates';
import { useHydrated } from '@/store/StoreHydrator';

export type ResolvedEstimate =
  | { state: 'loading' }
  | { state: 'missing' }
  | { state: 'ready'; input: EstimateInput; name: string; project: Project | null };

export function useResolvedEstimate(id: string): ResolvedEstimate {
  const t = useTranslations('app.rooms');
  const hydrated = useHydrated();
  const draft = useDraft();
  const projects = useEstimates((state) => state.projects);

  if (!hydrated) return { state: 'loading' };

  if (id === DEMO_ESTIMATE_ID || id === DRAFT_ESTIMATE_ID) {
    const input = id === DEMO_ESTIMATE_ID ? DEMO_INPUT : draftToInput(draft);
    return { state: 'ready', input, name: t(`${input.room}.name`), project: null };
  }

  const project = findProject(projects, id);
  if (!project) return { state: 'missing' };
  return { state: 'ready', input: project.input, name: project.name, project };
}
