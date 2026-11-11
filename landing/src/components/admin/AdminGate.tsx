'use client';

import { KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminApiError, createAdminApi } from '@/lib/admin/api';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/store/admin';
import { card, fieldLabel } from '../app/common/styles';

const UNAUTHORIZED = 401;

export function AdminGate() {
  const t = useTranslations('admin');
  const signIn = useAdmin((state) => state.signIn);
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const candidate = key.trim();
    if (!candidate) return;
    setChecking(true);
    setError(null);
    try {
      await createAdminApi(candidate).stores();
      signIn(candidate);
    } catch (failure) {
      setError(failure instanceof AdminApiError && failure.status === UNAUTHORIZED ? t('errors.unauthorized') : t('errors.network'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <form onSubmit={submit} className={cn(card, 'flex w-full max-w-[400px] flex-col gap-5 p-6')}>
        <Logo />
        <div>
          <h1 className="font-display text-2xl/8 font-semibold tracking-[-0.02em]">{t('gate.title')}</h1>
          <p className="mt-1 text-sm text-fg-2">{t('gate.lead')}</p>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('gate.key')}</span>
          <Input
            type="password"
            autoComplete="off"
            autoFocus
            value={key}
            aria-invalid={error !== null}
            onChange={(event) => setKey(event.target.value)}
          />
          {error && (
            <span role="alert" className="text-[13px] text-danger">
              {error}
            </span>
          )}
        </label>
        <Button type="submit" size="lg" disabled={checking || !key.trim()}>
          <KeyRound size={16} strokeWidth={1.75} aria-hidden />
          {t('gate.submit')}
        </Button>
      </form>
    </div>
  );
}
