import type { ReactNode } from 'react';
import { SettingsLayout } from '@/components/app/settings/SettingsLayout';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function SettingsRouteLayout({ children, params }: { children: ReactNode; params: LocaleParams }) {
  await resolveLocale(params);
  return <SettingsLayout>{children}</SettingsLayout>;
}
