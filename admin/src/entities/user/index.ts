import { useQuery } from '@tanstack/react-query';
import { http, query } from '@/shared/api';

export type PlanKind = 'free' | 'project' | 'pro';

export type User = {
  id: string;
  phone: string | null;
  email: string | null;
  name: string;
  telegramLinked: boolean;
  googleLinked: boolean;
  plan: { kind: PlanKind; expiresAt: string | null };
  usage: { estimates: number; limit: number | null };
  createdAt: string;
};

export const PLAN_LABEL: Record<PlanKind, string> = { free: 'Bepul', project: 'Loyiha', pro: 'Pro' };

export const userKeys = {
  all: ['users'] as const,
  search: (term: string) => ['users', term] as const,
};

export const useUsers = (term: string) =>
  useQuery({ queryKey: userKeys.search(term), queryFn: () => http.get<User[]>(`/admin/users${query({ query: term || undefined })}`) });
