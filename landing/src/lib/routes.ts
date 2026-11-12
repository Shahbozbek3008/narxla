import type { PlanKind } from './plans';

export const DEMO_ESTIMATE_ID = 'demo';
export const DRAFT_ESTIMATE_ID = 'draft';

export const SETTINGS_TABS = ['profile', 'preferences', 'notifications', 'appearance', 'billing', 'security'] as const;
export type SettingsTab = (typeof SETTINGS_TABS)[number];

export const isSettingsTab = (value: string): value is SettingsTab => (SETTINGS_TABS as readonly string[]).includes(value);

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
  shared: (token: string) => `/app/shared/${token}`,
  settings: '/app/settings',
  settingsTab: (tab: SettingsTab) => `/app/settings/${tab}`,
} as const;

export const withNext = (path: string, next: string) => `${path}?next=${encodeURIComponent(next)}`;
