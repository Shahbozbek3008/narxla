'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

const MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;

export function useFormatDate() {
  const t = useTranslations('app');

  return useCallback(
    (iso: string, withYear = false) => {
      const [year, month, day] = iso.split('-').map(Number);
      const values = { day, month: t(`months.${MONTHS[month - 1]}`), year };
      return withYear ? t('dateLong', values) : t('date', values);
    },
    [t],
  );
}

export const todayIso = () => new Date().toISOString().slice(0, 10);
