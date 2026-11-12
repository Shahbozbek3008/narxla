'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EstimateInput } from '../calc-engine';
import { isApiError, isUnauthorized } from './client';
import { authApi, estimatesApi, meApi } from './endpoints';
import type { EstimateRecord, EstimateStatus, Profile, ProfileFields, TelegramAuthData } from './types';

export const queryKeys = {
  me: ['me'] as const,
  payments: ['me', 'payments'] as const,
  estimates: ['estimates'] as const,
  estimate: (id: string) => ['estimates', id] as const,
  shared: (token: string) => ['shared', token] as const,
};

const MINUTE_MS = 60_000;

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) =>
      meApi.get(signal).catch((error: unknown) => {
        if (isUnauthorized(error)) return null;
        throw error;
      }),
    staleTime: 5 * MINUTE_MS,
    retry: (failures, error) => !isApiError(error) && failures < 2,
  });
}

export type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'guest'; user: null }
  | { status: 'authenticated'; user: Profile };

export function useAuth(): AuthState {
  const { data, isPending } = useMe();
  if (isPending) return { status: 'loading', user: null };
  return data ? { status: 'authenticated', user: data } : { status: 'guest', user: null };
}

export function useEstimateList() {
  const { status } = useAuth();
  return useQuery({
    queryKey: queryKeys.estimates,
    queryFn: ({ signal }) => estimatesApi.list(signal),
    enabled: status === 'authenticated',
  });
}

export function useEstimateRecord(id: string, enabled: boolean) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.estimate(id),
    queryFn: ({ signal }) => estimatesApi.get(id, signal),
    enabled,
    retry: (failures, error) => !isApiError(error) && failures < 2,
    initialData: () => queryClient.getQueryData<EstimateRecord[]>(queryKeys.estimates)?.find((item) => item.id === id),
  });
}

export function useSharedEstimate(token: string) {
  return useQuery({
    queryKey: queryKeys.shared(token),
    queryFn: ({ signal }) => estimatesApi.shared(token, signal),
    retry: (failures, error) => !isApiError(error) && failures < 2,
  });
}

export function usePayments(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.payments, queryFn: ({ signal }) => meApi.payments(signal), enabled });
}

function useSignedIn() {
  const queryClient = useQueryClient();
  return (profile: Profile) => {
    queryClient.removeQueries({ queryKey: queryKeys.estimates });
    queryClient.setQueryData(queryKeys.me, profile);
  };
}

export function useRequestCode() {
  return useMutation({ mutationFn: (phone: string) => authApi.requestCode(phone) });
}

export function useVerifyCode() {
  const signedIn = useSignedIn();
  return useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) => authApi.verifyCode(phone, code),
    onSuccess: signedIn,
  });
}

export function useTelegramSignIn() {
  const signedIn = useSignedIn();
  return useMutation({ mutationFn: (data: TelegramAuthData) => authApi.telegram(data), onSuccess: signedIn });
}

function useSignedOut() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.removeQueries({ queryKey: queryKeys.estimates });
    queryClient.removeQueries({ queryKey: queryKeys.payments });
    queryClient.setQueryData(queryKeys.me, null);
  };
}

export function useSignOut() {
  const signedOut = useSignedOut();
  return useMutation({ mutationFn: authApi.logout, onSettled: signedOut });
}

export function useDeleteAccount() {
  const signedOut = useSignedOut();
  return useMutation({ mutationFn: meApi.remove, onSuccess: signedOut });
}

export function useRevokeOtherSessions() {
  return useMutation({ mutationFn: meApi.revokeOtherSessions });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<ProfileFields>) => meApi.update(patch),
    onSuccess: (profile) => queryClient.setQueryData(queryKeys.me, profile),
  });
}

function useEstimateCache() {
  const queryClient = useQueryClient();
  return {
    put: (record: EstimateRecord) => {
      queryClient.setQueryData(queryKeys.estimate(record.id), record);
      queryClient.setQueryData<EstimateRecord[]>(queryKeys.estimates, (list) =>
        list?.some((item) => item.id === record.id)
          ? list.map((item) => (item.id === record.id ? record : item))
          : [record, ...(list ?? [])],
      );
    },
    drop: (id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.estimate(id) });
      queryClient.setQueryData<EstimateRecord[]>(queryKeys.estimates, (list) => list?.filter((item) => item.id !== id));
    },
    refreshUsage: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  };
}

export function useCreateEstimate() {
  const cache = useEstimateCache();
  return useMutation({
    mutationFn: ({ name, input }: { name: string; input: EstimateInput }) => estimatesApi.create(name, input),
    onSuccess: (record) => {
      cache.put(record);
      void cache.refreshUsage();
    },
  });
}

export function useUpdateEstimate() {
  const cache = useEstimateCache();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; name?: string; input?: EstimateInput; status?: EstimateStatus }) =>
      estimatesApi.update(id, patch),
    onSuccess: cache.put,
  });
}

export function useDeleteEstimate() {
  const cache = useEstimateCache();
  return useMutation({
    mutationFn: (id: string) => estimatesApi.remove(id).then(() => id),
    onSuccess: (id) => {
      cache.drop(id);
      void cache.refreshUsage();
    },
  });
}

export function useShareEstimate() {
  const cache = useEstimateCache();
  return useMutation({ mutationFn: (id: string) => estimatesApi.share(id), onSuccess: cache.put });
}
