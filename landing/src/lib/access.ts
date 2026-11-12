import { DEMO_ESTIMATE_ID, DRAFT_ESTIMATE_ID } from './routes';

const PROTECTED_PREFIX = /^\/app(\/|$)/;

const PUBLIC_APP_PATHS = [
  /^\/app\/new(\/|$)/,
  /^\/app\/calcs(\/|$)/,
  /^\/app\/check(\/|$)/,
  /^\/app\/shared(\/|$)/,
  new RegExp(`^/app/estimates/(${DEMO_ESTIMATE_ID}|${DRAFT_ESTIMATE_ID})(/|$)`),
];

export const isProtectedPath = (path: string) =>
  PROTECTED_PREFIX.test(path) && !PUBLIC_APP_PATHS.some((pattern) => pattern.test(path));

export const safeNextPath = (value: string | null | undefined) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : null;
