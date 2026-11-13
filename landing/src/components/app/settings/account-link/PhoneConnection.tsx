'use client';

import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { meApi } from '@/lib/api/endpoints';
import type { Profile } from '@/lib/api/types';
import { digitsOnly } from '@/lib/format';
import { loginErrorOf, type LoginError } from '../../login/loginErrors';
import { ConnectButton, DisconnectButton } from './MethodButtons';
import { type AccountLink, remainingMethods } from './useAccountLink';

const PHONE_DIGITS = 9;
const CODE_DIGITS = 6;
const PREFIX = '+998';

const formatLocal = (value: string) => {
  const digits = digitsOnly(value, PHONE_DIGITS);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ');
};

type Step = { kind: 'idle' } | { kind: 'phone' } | { kind: 'code'; phone: string };

export function PhoneConnection({ user, account }: { user: Profile; account: AccountLink }) {
  const t = useTranslations('app.settings.profile');
  const tLogin = useTranslations('login');
  const [step, setStep] = useState<Step>({ kind: 'idle' });
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<LoginError | null>(null);

  const requestCode = useMutation({
    mutationFn: (digits: string) => meApi.requestPhoneLink(digits),
    onSuccess: (_, digits) => {
      setError(null);
      setStep({ kind: 'code', phone: digits });
    },
    onError: (failure) => setError(loginErrorOf(failure)),
  });

  const reset = () => {
    setStep({ kind: 'idle' });
    setPhone('');
    setCode('');
    setError(null);
  };

  if (user.phone) {
    const onlyMethod = remainingMethods(user, 'phone') === 0;
    return (
      <DisconnectButton
        pending={account.pending}
        disabled={account.pending || onlyMethod}
        title={onlyMethod ? t('onlyMethod') : undefined}
        onClick={() => account.unlink('phone', () => meApi.unlinkMethod('phone'))}
      />
    );
  }

  if (step.kind === 'idle') {
    return <ConnectButton pending={account.pending} disabled={account.pending} onClick={() => setStep({ kind: 'phone' })} />;
  }

  const sendCode = (event: FormEvent) => {
    event.preventDefault();
    const digits = digitsOnly(phone, PHONE_DIGITS);
    if (digits.length === PHONE_DIGITS) requestCode.mutate(digits);
  };

  const confirm = (event: FormEvent) => {
    event.preventDefault();
    if (step.kind !== 'code' || code.length !== CODE_DIGITS) return;
    const linkedPhone = step.phone;
    account.link('phone', (merge) => meApi.linkPhone(linkedPhone, code, merge), reset);
  };

  return (
    <div className="flex w-full basis-full flex-col gap-2 pt-1">
      {step.kind === 'phone' ? (
        <form onSubmit={sendCode} className="flex flex-wrap items-center gap-2">
          <span className="relative flex min-w-[200px] flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-fg-2 tabular-nums">{PREFIX}</span>
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              autoFocus
              placeholder={t('phonePlaceholder')}
              value={phone}
              onChange={(event) => setPhone(formatLocal(event.target.value))}
              className="h-9 pl-14 text-sm"
            />
          </span>
          <Button type="submit" size="xs" disabled={requestCode.isPending || digitsOnly(phone, PHONE_DIGITS).length !== PHONE_DIGITS}>
            {t('sendCode')}
          </Button>
          <Button variant="ghost" size="xs" onClick={reset}>
            {t('mergeCancel')}
          </Button>
        </form>
      ) : (
        <form onSubmit={confirm} className="flex flex-wrap items-center gap-2">
          <span className="w-full text-xs text-fg-3">{t('codeSent', { phone: `${PREFIX} ${formatLocal(step.phone)}` })}</span>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            aria-label={t('codeLabel')}
            placeholder="••••••"
            value={code}
            onChange={(event) => setCode(digitsOnly(event.target.value, CODE_DIGITS))}
            className="h-9 w-32 text-center text-sm tracking-[0.3em] tabular-nums"
          />
          <Button type="submit" size="xs" disabled={account.pending || code.length !== CODE_DIGITS}>
            {t('confirmCode')}
          </Button>
          <Button variant="ghost" size="xs" onClick={reset}>
            {t('mergeCancel')}
          </Button>
        </form>
      )}
      {error && <p className="text-xs text-danger">{tLogin(`errors.${error.key}`, error.values)}</p>}
    </div>
  );
}
