'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminApiError, createAdminApi, type AdminApi } from '@/lib/admin/api';
import { useAdmin } from '@/store/admin';
import { notify } from '../app/common/notify';

const UNAUTHORIZED = 401;

export function useAdminApi() {
  const key = useAdmin((state) => state.key);
  return useMemo(() => createAdminApi(key), [key]);
}

function useErrorText() {
  const t = useTranslations('admin.errors');
  return useCallback(
    (error: unknown) => {
      if (error instanceof AdminApiError) return error.status === UNAUTHORIZED ? t('unauthorized') : error.message;
      return t('network');
    },
    [t],
  );
}

function useUnauthorizedSignOut() {
  const signOut = useAdmin((state) => state.signOut);
  return useCallback(
    (error: unknown) => {
      if (error instanceof AdminApiError && error.status === UNAUTHORIZED) signOut();
    },
    [signOut],
  );
}

type Resource<T> = { data: T | null; error: string | null; loading: boolean };

export function useAdminResource<T>(resourceKey: string, load: (api: AdminApi) => Promise<T>) {
  const api = useAdminApi();
  const errorText = useErrorText();
  const handleAuth = useUnauthorizedSignOut();
  const loadRef = useRef(load);
  const [version, setVersion] = useState(0);
  const [resource, setResource] = useState<Resource<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    let cancelled = false;
    loadRef.current(api).then(
      (data) => !cancelled && setResource({ data, error: null, loading: false }),
      (error: unknown) => {
        if (cancelled) return;
        handleAuth(error);
        setResource((current) => ({ ...current, error: errorText(error), loading: false }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [api, resourceKey, version, errorText, handleAuth]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);

  return { ...resource, reload };
}

export function useAdminAction() {
  const api = useAdminApi();
  const t = useTranslations('admin');
  const errorText = useErrorText();
  const handleAuth = useUnauthorizedSignOut();
  const [pending, setPending] = useState<string | null>(null);

  const run = useCallback(
    async <T>(id: string, action: (client: AdminApi) => Promise<T>, success?: string | ((result: T) => string)): Promise<T | null> => {
      setPending(id);
      try {
        const result = await action(api);
        if (success) notify({ title: typeof success === 'function' ? success(result) : success, kind: 'success', closeLabel: t('close') });
        return result;
      } catch (error) {
        handleAuth(error);
        notify({ title: t('errors.title'), description: errorText(error), kind: 'info', closeLabel: t('close') });
        return null;
      } finally {
        setPending(null);
      }
    },
    [api, errorText, handleAuth, t],
  );

  return { run, pending };
}

const DATE_TIME = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' });

export const formatDateTime = (iso: string | null) => (iso ? DATE_TIME.format(new Date(iso)) : '—');
