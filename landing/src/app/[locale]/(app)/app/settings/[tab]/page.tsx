import { notFound } from 'next/navigation';
import { SettingsTabPanel } from '@/components/app/settings/SettingsTabPanel';
import { resolveLocale, type LocaleParams } from '@/i18n/page';
import { isSettingsTab, SETTINGS_TABS } from '@/lib/routes';

export const generateStaticParams = () => SETTINGS_TABS.map((tab) => ({ tab }));

export default async function SettingsTabPage({ params }: { params: LocaleParams<{ tab: string }> }) {
  const { tab } = await resolveLocale(params);
  if (!isSettingsTab(tab)) notFound();
  return <SettingsTabPanel tab={tab} />;
}
