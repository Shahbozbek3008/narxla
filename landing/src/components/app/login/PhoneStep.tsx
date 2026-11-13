'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isApiError } from '@/lib/api/client';
import { useGoogleSignIn, useRequestCode, useTelegramSignIn } from '@/lib/api/queries';
import type { Profile } from '@/lib/api/types';
import { digitsOnly } from '@/lib/format';
import { FieldError } from '../common/NumberField';
import { fieldLabel } from '../common/styles';
import { GoogleButton } from './GoogleButton';
import { type LoginError, loginErrorOf } from './loginErrors';
import type { PendingCode } from './LoginScreen';
import { GOOGLE_CLIENT_ID } from './useGoogleLogin';
import { useTelegramLogin } from './useTelegramLogin';

const PHONE_DIGITS = 9;

const formatPhone = (value: string) => {
  const digits = digitsOnly(value, PHONE_DIGITS);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ');
};

type PhoneStepProps = {
  onCodeSent: (pending: PendingCode) => void;
  onSignedIn: (profile: Profile) => void;
};

export function PhoneStep({ onCodeSent, onSignedIn }: PhoneStepProps) {
  const t = useTranslations('login');
  const [phone, setPhone] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const requestCode = useRequestCode();
  const telegramSignIn = useTelegramSignIn();
  const googleSignIn = useGoogleSignIn();

  const telegram = useTelegramLogin(
    (data) => telegramSignIn.mutate(data, { onSuccess: onSignedIn, onError: (failure) => setError(loginErrorOf(failure)) }),
    () => setError({ key: 'telegram', values: {} }),
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const digits = digitsOnly(phone, PHONE_DIGITS);
    if (digits.length !== PHONE_DIGITS) return setInvalid(true);
    setError(null);
    const pending = (resendIn: number) => onCodeSent({ phone: digits, display: `${t('prefix')} ${formatPhone(digits)}`, resendIn });
    requestCode.mutate(digits, {
      onSuccess: ({ resendIn }) => pending(resendIn),
      onError: (failure) => {
        if (isApiError(failure, 'OTP_COOLDOWN')) return pending(loginErrorOf(failure).values.seconds);
        setError(loginErrorOf(failure));
      },
    });
  };

  const busy = requestCode.isPending || telegramSignIn.isPending || googleSignIn.isPending;
  const socialEnabled = telegram.enabled || GOOGLE_CLIENT_ID !== '';

  return (
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
            autoFocus
            placeholder="90 123 45 67"
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
        {error && <FieldError>{t(`errors.${error.key}`, error.values)}</FieldError>}
      </label>
      <Button
        type="submit"
        size="xl"
        disabled={busy}
        className="text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_8px_24px_-10px_var(--glow)]"
      >
        {requestCode.isPending ? t('sending') : t('getCode')}
      </Button>
      {socialEnabled && (
        <div className="flex items-center gap-3 text-xs text-fg-3">
          <span className="h-px flex-1 bg-line" />
          {t('or')}
          <span className="h-px flex-1 bg-line" />
        </div>
      )}
      <GoogleButton
        disabled={busy}
        onCredential={(credential) =>
          googleSignIn.mutate(credential, { onSuccess: onSignedIn, onError: (failure) => setError(loginErrorOf(failure)) })
        }
        onFailure={() => setError({ key: 'google', values: {} })}
      />
      {telegram.enabled && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="xl"
            disabled={busy || !telegram.ready}
            className="text-[15px] shadow-none"
            onClick={telegram.start}
          >
            <Send size={18} strokeWidth={1.5} aria-hidden />
            {t('telegram')}
          </Button>
        </>
      )}
    </form>
  );
}
