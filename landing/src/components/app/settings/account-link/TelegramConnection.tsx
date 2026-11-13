'use client';

import { useTranslations } from 'next-intl';
import { meApi } from '@/lib/api/endpoints';
import type { Profile, TelegramAuthData } from '@/lib/api/types';
import { useNotify } from '../../common/useNotify';
import { useTelegramLogin } from '../../login/useTelegramLogin';
import { ConnectButton, DisconnectButton } from './MethodButtons';
import { type AccountLink, remainingMethods } from './useAccountLink';

export function TelegramConnection({ user, account }: { user: Profile; account: AccountLink }) {
  const t = useTranslations('app.settings.profile');
  const notify = useNotify();
  const onAuth = (data: TelegramAuthData) => account.link('telegram', (merge) => meApi.linkTelegram(data, merge));
  const onFailure = () => notify('telegramFailed', 'info');
  const telegram = useTelegramLogin(onAuth, onFailure);

  if (user.telegramLinked) {
    const onlyMethod = remainingMethods(user, 'telegram') === 0;
    return (
      <DisconnectButton
        pending={account.pending}
        disabled={account.pending || onlyMethod}
        title={onlyMethod ? t('onlyMethod') : undefined}
        onClick={() => account.unlink('telegram', () => meApi.unlinkMethod('telegram'))}
      />
    );
  }

  return (
    <ConnectButton
      pending={account.pending}
      disabled={account.pending || !telegram.ready}
      title={telegram.enabled ? undefined : t('telegramUnavailable')}
      onClick={telegram.start}
    />
  );
}
