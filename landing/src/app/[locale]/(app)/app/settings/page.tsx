import { redirect } from '@/i18n/navigation';
import { resolveLocale, type LocaleParams } from '@/i18n/page';
import { routes } from '@/lib/routes';

export default async function SettingsPage({ params }: { params: LocaleParams }) {
  const { locale } = await resolveLocale(params);
  redirect({ href: routes.settingsTab('profile'), locale });
}
