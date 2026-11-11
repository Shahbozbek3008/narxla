import { create } from 'zustand';
import type { PlanKind } from '@/lib/plans';

type PlanState = {
  kind: PlanKind;
  paidAt: string;
  trackingUntil: string;
  cardLast4: string;
};

export const usePlan = create<PlanState>()(() => ({
  kind: 'project',
  paidAt: '2026-11-14',
  trackingUntil: '2027-05-14',
  cardLast4: '4821',
}));
