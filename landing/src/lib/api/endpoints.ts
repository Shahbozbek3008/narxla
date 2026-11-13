import type { EstimateInput } from '../calc-engine';
import { ApiError, apiRequest } from './client';
import type {
  EstimateRecord,
  EstimateStatus,
  OtpRequested,
  Payment,
  Profile,
  ProfileFields,
  SharedEstimate,
  SignInMethod,
  TelegramAuthData,
} from './types';

export const authApi = {
  requestCode: (phone: string) => apiRequest<OtpRequested>('/auth/otp', { method: 'POST', body: { phone } }),
  verifyCode: (phone: string, code: string) => apiRequest<Profile>('/auth/otp/verify', { method: 'POST', body: { phone, code } }),
  telegram: (data: TelegramAuthData) => apiRequest<Profile>('/auth/telegram', { method: 'POST', body: data }),
  google: (credential: string) => apiRequest<Profile>('/auth/google', { method: 'POST', body: { credential } }),
  logout: () => apiRequest<void>('/auth/logout', { method: 'POST' }),
};

export const meApi = {
  get: (signal?: AbortSignal) => apiRequest<Profile>('/me', { signal }),
  update: (patch: Partial<ProfileFields>) => apiRequest<Profile>('/me', { method: 'PATCH', body: patch }),
  remove: () => apiRequest<void>('/me', { method: 'DELETE' }),
  payments: (signal?: AbortSignal) => apiRequest<Payment[]>('/me/payments', { signal }),
  linkTelegram: (data: TelegramAuthData, merge = false) => apiRequest<Profile>('/me/telegram', { method: 'POST', body: { ...data, merge } }),
  linkGoogle: (credential: string, merge = false) => apiRequest<Profile>('/me/google', { method: 'POST', body: { credential, merge } }),
  requestPhoneLink: (phone: string) => apiRequest<OtpRequested>('/me/phone/otp', { method: 'POST', body: { phone } }),
  linkPhone: (phone: string, code: string, merge = false) => apiRequest<Profile>('/me/phone', { method: 'POST', body: { phone, code, merge } }),
  unlinkMethod: (method: SignInMethod) => apiRequest<Profile>(`/me/${method}`, { method: 'DELETE' }),
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

export const assistantApi = {
  transcribe: async (pcm: Int16Array, lang: string) => {
    const response = await fetch(`/api/assistant/transcribe?lang=${lang}`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/octet-stream', accept: 'application/json' },
      body: pcm.slice().buffer as ArrayBuffer,
    });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) throw ApiError.from(response.status, payload);
    return payload as { text: string };
  },
};
