import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/shell/AppShell';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

type AppLayoutProps = {
  children: ReactNode;
  params: LocaleParams;
};

export async function generateMetadata({ params }: Pick<AppLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'app.meta' });
  return { title: t('title'), robots: { index: false } };
}

export default async function AppLayout({ children, params }: AppLayoutProps) {
  await resolveLocale(params);
  return <AppShell>{children}</AppShell>;
}
