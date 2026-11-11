import { SettingsScreen } from '@/components/app/settings/SettingsScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function SettingsPage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return <SettingsScreen />;
}
