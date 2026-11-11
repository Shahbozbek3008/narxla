import type { PlanKind } from './plans';

export const DEMO_ESTIMATE_ID = 'demo';
export const DRAFT_ESTIMATE_ID = 'draft';

export const SETTINGS_SECTIONS = ['s-profil', 's-smeta', 's-bildirish', 's-korinish', 's-tarif', 's-hisob'] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

export const routes = {
  home: '/',
  login: '/login',
  app: '/app',
  estimates: '/app/estimates',
  estimate: (id: string) => `/app/estimates/${id}`,
  estimatePdf: (id: string) => `/app/estimates/${id}/pdf`,
  demo: `/app/estimates/${DEMO_ESTIMATE_ID}`,
  newEstimate: '/app/new',
  newEstimateStep: (step: number) => `/app/new?step=${step}`,
  newEstimatePlan: (plan: PlanKind) => `/app/new?plan=${plan}`,
  check: '/app/check',
  calcs: '/app/calcs',
  calc: (id: string) => `/app/calcs/${id}`,
  settings: '/app/settings',
  settingsSection: (section: SettingsSection) => `/app/settings#${section}`,
} as const;

export const withNext = (path: string, next: string) => `${path}?next=${encodeURIComponent(next)}`;
