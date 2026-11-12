'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isApiError } from '@/lib/api/client';
import { useRequestCode, useVerifyCode } from '@/lib/api/queries';
import type { Profile } from '@/lib/api/types';
import { digitsOnly } from '@/lib/format';
import { FieldError } from '../common/NumberField';
import { fieldLabel } from '../common/styles';
import { type LoginError, loginErrorOf } from './loginErrors';
import type { PendingCode } from './LoginScreen';

const CODE_LENGTH = 6;
const TICK_MS = 1000;

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
    if (seconds <= 0) return;
    const timer = window.setInterval(() => setLeft((value) => Math.max(0, value - 1)), TICK_MS);
    return () => window.clearInterval(timer);
  }, [seconds]);

  return left;
}

type CodeStepProps = {
  pending: PendingCode;
  onResent: (pending: PendingCode) => void;
  onBack: () => void;
  onSignedIn: (profile: Profile) => void;
};

export function CodeStep({ pending, onResent, onBack, onSignedIn }: CodeStepProps) {
  const t = useTranslations('login');
  const [code, setCode] = useState('');
  const [error, setError] = useState<LoginError | null>(null);
  const verify = useVerifyCode();
  const resend = useRequestCode();
  const left = useCountdown(pending.resendIn);

  const check = (value: string) => {
    if (value.length !== CODE_LENGTH || verify.isPending) return;
    setError(null);
    verify.mutate(
      { phone: pending.phone, code: value },
      {
        onSuccess: onSignedIn,
        onError: (failure) => {
          setError(loginErrorOf(failure));
          setCode('');
        },
      },
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    check(code);
  };

  const requestAgain = () => {
    setError(null);
    resend.mutate(pending.phone, {
      onSuccess: ({ resendIn }) => onResent({ ...pending, resendIn }),
      onError: (failure) => {
        if (isApiError(failure, 'OTP_COOLDOWN')) return onResent({ ...pending, resendIn: loginErrorOf(failure).values.seconds });
        setError(loginErrorOf(failure));
      },
    });
  };

  return (
    <form
      noValidate
      onSubmit={submit}
      className="sheen mt-8 flex w-full flex-col gap-3 rounded-[20px] border border-line-2 bg-surface p-6 text-left shadow-(--shadow-elev)"
    >
      <label className="flex flex-col gap-1.5">
        <span className={fieldLabel}>{t('code')}</span>
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={CODE_LENGTH}
          placeholder="••••••"
          aria-invalid={error ? true : undefined}
          className="h-12 text-center font-display text-2xl tracking-[0.5em]"
          value={code}
          onChange={(event) => {
            const value = digitsOnly(event.target.value, CODE_LENGTH);
            setCode(value);
            check(value);
          }}
        />
        {error && <FieldError>{t(`errors.${error.key}`, error.values)}</FieldError>}
      </label>
      <Button type="submit" size="xl" disabled={code.length !== CODE_LENGTH || verify.isPending} className="text-[15px]">
        {verify.isPending ? t('verifying') : t('verify')}
      </Button>
      <div className="flex items-center justify-between text-[13px]">
        <button type="button" className="text-fg-2 transition-colors duration-150 hover:text-fg" onClick={onBack}>
          {t('changePhone')}
        </button>
        {left > 0 ? (
          <span className="text-fg-3 tabular-nums">{t('resendIn', { seconds: left })}</span>
        ) : (
          <button
            type="button"
            disabled={resend.isPending}
            className="font-medium text-accent-text transition-opacity duration-150 hover:opacity-80 disabled:opacity-50"
            onClick={requestAgain}
          >
            {t('resend')}
          </button>
        )}
      </div>
    </form>
  );
}
