'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import type messages from '../../../../messages/uz.json';
import { notify } from './notify';

export type ToastKey = Exclude<keyof (typeof messages)['app']['toasts'], 'close'>;

type ToastValues = Record<string, string | number>;

export function useNotify() {
  const t = useTranslations('app.toasts');

  return useCallback(
    (key: ToastKey, kind: 'success' | 'info' = 'success', values?: ToastValues) =>
      notify({
        title: t(`${key}.title`, values),
        description: t(`${key}.text`, values),
        kind,
        closeLabel: t('close'),
      }),
    [t],
  );
}
