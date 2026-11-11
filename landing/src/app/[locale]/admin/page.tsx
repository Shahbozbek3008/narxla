import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { AdminScreen } from '@/components/admin/AdminScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

type AdminPageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: AdminPageProps): Promise<Metadata> {
  const { locale } = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'admin' });
  return { title: t('metaTitle'), robots: { index: false, follow: false } };
}

export default async function AdminPage({ params }: AdminPageProps) {
  await resolveLocale(params);
  return <AdminScreen />;
}
