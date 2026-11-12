'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

type FormActionsProps = {
  dirty: boolean;
  saving: boolean;
  onReset: () => void;
  onSave: () => void;
};

export function FormActions({ dirty, saving, onReset, onSave }: FormActionsProps) {
  const t = useTranslations('app.settings.actions');

  return (
    <>
      <Button variant="ghost" size="sm" disabled={!dirty || saving} onClick={onReset}>
        {t('cancel')}
      </Button>
      <Button size="sm" className="min-w-24 shadow-none" disabled={!dirty || saving} onClick={onSave}>
        {saving && <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden />}
        {saving ? t('saving') : t('save')}
      </Button>
    </>
  );
}
