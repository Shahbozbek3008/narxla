import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { PageHeader } from '../common/PageHeader';
import { SettingsTabs } from './SettingsTabs';

export function SettingsLayout({ children }: { children: ReactNode }) {
  const t = useTranslations('app.settings');

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-5">
        <PageHeader title={t('title')} subtitle={t('lead')} />
        <SettingsTabs />
      </div>
      {children}
    </div>
  );
}
