'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { isApiError } from '@/lib/api/client';
import { useLinkTelegram, useUnlinkTelegram } from '@/lib/api/queries';
import type { Profile, TelegramAuthData } from '@/lib/api/types';
import { useNotify } from '../common/useNotify';
import { useTelegramLogin } from '../login/useTelegramLogin';

export function TelegramConnection({ user }: { user: Profile }) {
  const t = useTranslations('app.settings.profile');
  const notify = useNotify();
  const link = useLinkTelegram();
  const unlink = useUnlinkTelegram();
  const { mutate: linkTelegram } = link;

  const onAuth = useCallback(
    (data: TelegramAuthData) =>
      linkTelegram(data, {
        onSuccess: () => notify('telegramLinked'),
        onError: (error) => notify(isApiError(error, 'TELEGRAM_TAKEN') ? 'telegramTaken' : 'telegramFailed', 'info'),
      }),
    [linkTelegram, notify],
  );
  const onFailure = useCallback(() => notify('telegramFailed', 'info'), [notify]);
  const telegram = useTelegramLogin(onAuth, onFailure);

  const busy = link.isPending || unlink.isPending;
  const spinner = busy && <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden />;

  if (user.telegramLinked) {
    const onlyMethod = user.phone === null;
    return (
      <Button
        variant="ghost"
        size="xs"
        className="shrink-0 text-danger hover:bg-danger-soft hover:text-danger"
        disabled={busy || onlyMethod}
        title={onlyMethod ? t('onlyMethod') : undefined}
        onClick={() =>
          unlink.mutate(undefined, {
            onSuccess: () => notify('telegramUnlinked'),
            onError: () => notify('actionFailed', 'info'),
          })
        }
      >
        {spinner}
        {t('disconnect')}
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="xs"
      className="shrink-0"
      disabled={busy || !telegram.ready}
      title={telegram.enabled ? undefined : t('telegramUnavailable')}
      onClick={telegram.start}
    >
      {spinner}
      {t('connect')}
    </Button>
  );
}
