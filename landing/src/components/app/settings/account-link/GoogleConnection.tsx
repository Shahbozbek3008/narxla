'use client';

import { useTranslations } from 'next-intl';
import { meApi } from '@/lib/api/endpoints';
import type { Profile } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useNotify } from '../../common/useNotify';
import { useGoogleLogin } from '../../login/useGoogleLogin';
import { ConnectButton, DisconnectButton } from './MethodButtons';
import { type AccountLink, remainingMethods } from './useAccountLink';

export function GoogleConnection({ user, account }: { user: Profile; account: AccountLink }) {
  const t = useTranslations('app.settings.profile');
  const notify = useNotify();
  const onCredential = (credential: string) => account.link('google', (merge) => meApi.linkGoogle(credential, merge));
  const onFailure = () => notify('linkFailed', 'info');
  const google = useGoogleLogin(onCredential, onFailure);

  if (user.googleLinked) {
    const onlyMethod = remainingMethods(user, 'google') === 0;
    return (
      <DisconnectButton
        pending={account.pending}
        disabled={account.pending || onlyMethod}
        title={onlyMethod ? t('onlyMethod') : undefined}
        onClick={() => account.unlink('google', () => meApi.unlinkMethod('google'))}
      />
    );
  }

  const inactive = account.pending || !google.ready;

  return (
    <div className="relative shrink-0" title={google.enabled ? undefined : t('googleUnavailable')}>
      <ConnectButton pending={account.pending} disabled={inactive} tabIndex={-1} aria-hidden />
      <div
        ref={google.slot}
        className={cn('absolute inset-0 overflow-hidden rounded-lg opacity-[0.01]', inactive && 'pointer-events-none')}
        aria-label={t('connect')}
      />
    </div>
  );
}
