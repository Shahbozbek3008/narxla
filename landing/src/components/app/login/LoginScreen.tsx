'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { LogoMark } from '@/components/brand/Logo';
import { Link, useRouter } from '@/i18n/navigation';
import { safeNextPath } from '@/lib/access';
import { useAuth } from '@/lib/api/queries';
import type { Profile } from '@/lib/api/types';
import { routes } from '@/lib/routes';
import { useNotify } from '../common/useNotify';
import { CodeStep } from './CodeStep';
import { PhoneStep } from './PhoneStep';

export type PendingCode = { phone: string; display: string; resendIn: number };

export function LoginScreen() {
  const t = useTranslations('login');
  const router = useRouter();
  const next = useSearchParams().get('next');
  const notify = useNotify();
  const [pending, setPending] = useState<PendingCode | null>(null);
  const { status } = useAuth();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && !entered) router.replace(safeNextPath(next) ?? routes.estimates);
  }, [status, entered, router, next]);

  const signedIn = useCallback(
    (profile: Profile) => {
      setEntered(true);
      router.replace(safeNextPath(next) ?? routes.estimates);
      notify('welcome', 'success', { name: profile.name.split(' ')[0] || profile.phone || '' });
    },
    [router, next, notify],
  );

  const terms = t.rich('terms', {
    link: (chunks) => (
      <a href="#" className="text-fg-2 underline underline-offset-2">
        {chunks}
      </a>
    ),
  });

  return (
    <main className="relative grid min-h-screen animate-[screen-in_.6s_var(--ease-out-expo)_both] place-items-center overflow-x-hidden px-4 py-6">
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 bg-size-[56px_56px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_10%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-50 left-1/2 h-140 w-225 -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,var(--glow),transparent_62%)]"
      />

      <div className="relative flex w-full max-w-[400px] flex-col items-center text-center">
        <span className="rounded-2xl shadow-[0_12px_32px_-8px_var(--glow)]">
          <LogoMark size={56} />
        </span>
        <h1 className="mt-6 font-display text-[28px]/9 font-semibold tracking-[-0.03em]">
          {pending ? t('codeTitle') : t('title')}
        </h1>
        <p className="mt-2 text-[15px] text-fg-2">{pending ? t('codeLead', { phone: pending.display }) : t('lead')}</p>

        {pending ? (
          <CodeStep pending={pending} onResent={setPending} onBack={() => setPending(null)} onSignedIn={signedIn} />
        ) : (
          <PhoneStep onCodeSent={setPending} onSignedIn={signedIn} />
        )}

        <Link href={routes.home} className="mt-4 text-[13px] text-fg-2 transition-colors duration-150 hover:text-fg">
          {t('back')}
        </Link>
        <p className="mt-3 max-w-[300px] text-xs/[18px] text-fg-3">{terms}</p>
      </div>
    </main>
  );
}
