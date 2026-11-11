'use client';

import { Send } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { LogoMark } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useRouter } from '@/i18n/navigation';
import { safeNextPath } from '@/lib/access';
import { digitsOnly } from '@/lib/format';
import { routes } from '@/lib/routes';
import { useSession } from '@/store/session';
import { useSettings } from '@/store/settings';
import { FieldError } from '../common/NumberField';
import { fieldLabel } from '../common/styles';
import { useNotify } from '../common/useNotify';

const PHONE_DIGITS = 9;
const DEFAULT_PHONE = '90 123 45 67';

const formatPhone = (value: string) => {
  const digits = digitsOnly(value, PHONE_DIGITS);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ');
};

export function LoginScreen() {
  const t = useTranslations('login');
  const router = useRouter();
  const next = useSearchParams().get('next');
  const signIn = useSession((state) => state.signIn);
  const name = useSettings((state) => state.saved.name);
  const notify = useNotify();
  const [phone, setPhone] = useState(DEFAULT_PHONE);
  const [invalid, setInvalid] = useState(false);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (digitsOnly(phone, PHONE_DIGITS).length !== PHONE_DIGITS) return setInvalid(true);
    signIn(`${t('prefix')} ${phone}`);
    router.replace(safeNextPath(next) ?? routes.estimates);
    notify('welcome', 'success', { name: name.split(' ')[0] });
  };

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
        <h1 className="mt-6 font-display text-[28px]/9 font-semibold tracking-[-0.03em]">{t('title')}</h1>
        <p className="mt-2 text-[15px] text-fg-2">{t('lead')}</p>

        <form
          noValidate
          onSubmit={submit}
          className="sheen mt-8 flex w-full flex-col gap-3 rounded-[20px] border border-line-2 bg-surface p-6 text-left shadow-(--shadow-elev)"
        >
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>{t('phone')}</span>
            <span className="relative flex">
              <span className="pointer-events-none absolute top-3 left-3.5 text-base text-fg-2 tabular-nums">{t('prefix')}</span>
              <Input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                className="h-12 pl-[62px]"
                aria-invalid={invalid || undefined}
                value={phone}
                onChange={(event) => {
                  setInvalid(false);
                  setPhone(formatPhone(event.target.value));
                }}
              />
            </span>
            {invalid && <FieldError>{t('invalidPhone')}</FieldError>}
          </label>
          <Button type="submit" size="xl" className="text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_8px_24px_-10px_var(--glow)]">
            {t('getCode')}
          </Button>
          <div className="flex items-center gap-3 text-xs text-fg-3">
            <span className="h-px flex-1 bg-line" />
            {t('or')}
            <span className="h-px flex-1 bg-line" />
          </div>
          <Button variant="secondary" size="xl" className="text-[15px] shadow-none" onClick={() => submit()}>
            <Send size={18} strokeWidth={1.5} aria-hidden />
            {t('telegram')}
          </Button>
        </form>

        <Link href={routes.home} className="mt-4 text-[13px] text-fg-2 transition-colors duration-150 hover:text-fg">
          {t('back')}
        </Link>
        <p className="mt-3 max-w-[300px] text-xs/[18px] text-fg-3">{terms}</p>
      </div>
    </main>
  );
}
