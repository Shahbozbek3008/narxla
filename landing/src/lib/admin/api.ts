import type {
  AdminListing,
  AdminMaterial,
  AdminStore,
  CheckResult,
  LabourRate,
  NewListing,
  ObservationStatus,
  PreviewResult,
  PriceReport,
  ReportStatus,
  ReviewItem,
  ScrapeRun,
} from './types';
import type { Profile } from '../api/types';

export const ADMIN_KEY_HEADER = 'x-admin-key';

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

const messageOf = (payload: unknown) => {
  if (typeof payload !== 'object' || payload === null || !('message' in payload)) return null;
  const { message } = payload;
  return Array.isArray(message) ? message.join(', ') : typeof message === 'string' ? message : null;
};

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export function createAdminApi(key: string) {
  async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
    const response = await fetch(`/api/admin${path}`, {
      method,
      headers: { [ADMIN_KEY_HEADER]: key, accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
    if (response.status === 204) return undefined as T;
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new AdminApiError(response.status, messageOf(payload) ?? response.statusText);
    return payload as T;
  }

  const query = (params: Record<string, string>) => `?${new URLSearchParams(params)}`;

  return {
    materials: () => request<AdminMaterial[]>('GET', '/materials'),
    stores: () => request<AdminStore[]>('GET', '/stores'),
    listings: (materialCode: string) => request<AdminListing[]>('GET', `/listings${query({ materialCode })}`),
    createListing: (listing: NewListing) => request<AdminListing>('POST', '/listings', listing),
    setListingActive: (id: string, active: boolean) => request<AdminListing>('PATCH', `/listings/${id}`, { active }),
    deleteListing: (id: string) => request<void>('DELETE', `/listings/${id}`),
    checkListing: (id: string) => request<CheckResult>('POST', `/scraper/listings/${id}/check`),
    preview: (storeCode: string, url: string) => request<PreviewResult>('POST', '/scraper/preview', { storeCode, url }),
    observations: (status: ObservationStatus) => request<ReviewItem[]>('GET', `/observations${query({ status })}`),
    approve: (id: string) => request<unknown>('POST', `/observations/${id}/approve`),
    reject: (id: string) => request<unknown>('POST', `/observations/${id}/reject`, {}),
    labour: () => request<LabourRate[]>('GET', '/labour-rates'),
    updateLabour: (code: string, rate: Pick<LabourRate, 'minPrice' | 'price' | 'maxPrice'>) =>
      request<LabourRate>('PATCH', `/labour-rates/${code}`, rate),
    runs: () => request<ScrapeRun[]>('GET', '/scraper/runs'),
    startRun: () => request<ScrapeRun>('POST', '/scraper/runs'),
    reports: (status: ReportStatus) => request<PriceReport[]>('GET', `/price-reports${query({ status })}`),
    users: (search: string) => request<Profile[]>('GET', `/users${query(search ? { query: search } : {})}`),
    grantPlan: (id: string, plan: 'project' | 'pro') => request<Profile>('POST', `/users/${id}/plan`, { plan }),
    resolveReport: (id: string, status: Exclude<ReportStatus, 'OPEN'>) => request<PriceReport>('PATCH', `/price-reports/${id}`, { status }),
  };
}

export type AdminApi = ReturnType<typeof createAdminApi>;
