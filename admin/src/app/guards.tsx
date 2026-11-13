import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useSession } from '@/entities/session';
import { routes } from '@/shared/config';

export function RequireSession({ children }: { children: ReactNode }) {
  const key = useSession((state) => state.key);
  return key ? children : <Navigate to={routes.login} replace />;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const key = useSession((state) => state.key);
  return key ? <Navigate to={routes.review} replace /> : children;
}
