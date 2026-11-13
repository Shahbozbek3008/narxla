import type { EstimateInput } from '../calc-engine';
import { apiRequest } from './client';
import type {
  EstimateRecord,
  EstimateStatus,
  OtpRequested,
  Payment,
  Profile,
  ProfileFields,
  SharedEstimate,
  TelegramAuthData,
} from './types';

export const authApi = {
  requestCode: (phone: string) => apiRequest<OtpRequested>('/auth/otp', { method: 'POST', body: { phone } }),
  verifyCode: (phone: string, code: string) => apiRequest<Profile>('/auth/otp/verify', { method: 'POST', body: { phone, code } }),
  telegram: (data: TelegramAuthData) => apiRequest<Profile>('/auth/telegram', { method: 'POST', body: data }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
};

export const meApi = {
  get: (signal?: AbortSignal) => apiRequest<Profile>('/me', { signal }),
  update: (patch: Partial<ProfileFields>) => apiRequest<Profile>('/me', { method: 'PATCH', body: patch }),
  remove: () => apiRequest<void>('/me', { method: 'DELETE' }),
  payments: (signal?: AbortSignal) => apiRequest<Payment[]>('/me/payments', { signal }),
  linkTelegram: (data: TelegramAuthData) => apiRequest<Profile>('/me/telegram', { method: 'POST', body: data }),
  unlinkTelegram: () => apiRequest<Profile>('/me/telegram', { method: 'DELETE' }),
  revokeOtherSessions: () => apiRequest<{ revoked: number }>('/me/sessions', { method: 'DELETE' }),
};

export const estimatesApi = {
  list: (signal?: AbortSignal) => apiRequest<EstimateRecord[]>('/estimates', { signal }),
  get: (id: string, signal?: AbortSignal) => apiRequest<EstimateRecord>(`/estimates/${id}`, { signal }),
  create: (name: string, input: EstimateInput) => apiRequest<EstimateRecord>('/estimates', { method: 'POST', body: { name, input } }),
  update: (id: string, patch: Partial<{ name: string; input: EstimateInput; status: EstimateStatus }>) =>
    apiRequest<EstimateRecord>(`/estimates/${id}`, { method: 'PATCH', body: patch }),
  remove: (id: string) => apiRequest<void>(`/estimates/${id}`, { method: 'DELETE' }),
  share: (id: string) => apiRequest<EstimateRecord>(`/estimates/${id}/share`, { method: 'POST' }),
  shared: (token: string, signal?: AbortSignal) => apiRequest<SharedEstimate>(`/shared/${token}`, { signal }),
};
