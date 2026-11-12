'use client';

import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type ComponentType } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { useAdmin } from '@/store/admin';
import { useHydrated } from '@/store/StoreHydrator';
import { AdminGate } from './AdminGate';
import { LabourPanel } from './LabourPanel';
import { ListingsPanel } from './ListingsPanel';
import { ReportsPanel } from './ReportsPanel';
import { ReviewPanel } from './ReviewPanel';
import { ScraperPanel } from './ScraperPanel';
import { UsersPanel } from './UsersPanel';

const TABS = ['review', 'listings', 'labour', 'scraper', 'users', 'reports'] as const;
type Tab = (typeof TABS)[number];

const PANELS: Record<Tab, ComponentType> = {
  review: ReviewPanel,
  listings: ListingsPanel,
  labour: LabourPanel,
  scraper: ScraperPanel,
  users: UsersPanel,
  reports: ReportsPanel,
};

export function AdminScreen() {
  const t = useTranslations('admin');
  const hydrated = useHydrated();
  const { key, signOut } = useAdmin();
  const [tab, setTab] = useState<Tab>('review');
  const Panel = PANELS[tab];

  if (!hydrated) return null;
  if (!key) return <AdminGate />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1200px] flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <span className="flex items-center gap-3">
          <Logo />
          <span className="rounded-md bg-surface-3 px-2 text-xs/[22px] font-semibold text-fg-2">{t('badge')}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut size={16} strokeWidth={1.5} aria-hidden />
          {t('signOut')}
        </Button>
      </header>

      <Segmented<Tab>
        wrap
        size="md"
        label={t('tabsLabel')}
        value={tab}
        onChange={setTab}
        options={TABS.map((value) => ({ value, label: t(`tabs.${value}`) }))}
        className="max-w-full self-start"
      />

      <main className="flex-1 pb-12">
        <Panel />
      </main>
    </div>
  );
}
