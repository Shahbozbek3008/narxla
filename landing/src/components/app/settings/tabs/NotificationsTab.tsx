'use client';

import { BellRing, Newspaper, Send, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Switch } from '@/components/ui/switch';
import { FormActions } from '../FormActions';
import { SettingsCard, SettingsFooter } from '../SettingsCard';
import { useProfileForm } from '../useProfileForm';

const FIELDS = ['notifyPrice', 'notifyTelegram', 'notifyNews'] as const;

const ICONS: Record<(typeof FIELDS)[number], LucideIcon> = {
  notifyPrice: BellRing,
  notifyTelegram: Send,
  notifyNews: Newspaper,
};

export function NotificationsTab() {
  const t = useTranslations('app.settings.notifications');
  const form = useProfileForm(FIELDS);
  const { values } = form;

  if (!values) return null;

  return (
    <SettingsCard
      title={t('title')}
      description={t('lead')}
      footer={
        <SettingsFooter note={t('note')}>
          <FormActions dirty={form.dirty} saving={form.saving} onReset={form.reset} onSave={form.save} />
        </SettingsFooter>
      }
    >
      {FIELDS.map((key) => {
        const Icon = ICONS[key];
        return (
          <label key={key} className="flex cursor-pointer items-center gap-4 px-4 sm:px-6 py-4 transition-colors duration-150 hover:bg-surface-2/60">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-2 text-fg-2">
              <Icon size={16} strokeWidth={1.5} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm/5 font-medium">{t(`${key}.title`)}</span>
              <span className="text-[13px]/[18px] text-fg-3">{t(`${key}.desc`)}</span>
            </span>
            <Switch checked={values[key]} onCheckedChange={(checked) => form.set(key, checked)} />
          </label>
        );
      })}
    </SettingsCard>
  );
}
