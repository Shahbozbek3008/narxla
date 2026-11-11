import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { LoginScreen } from '@/components/app/login/LoginScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

type LoginPageProps = {
  params: LocaleParams;
};

export async function generateMetadata({ params }: Pick<LoginPageProps, 'params'>): Promise<Metadata> {
  const { locale } = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: 'login' });
  return { title: t('title'), robots: { index: false } };
}

export default async function LoginPage({ params }: LoginPageProps) {
  await resolveLocale(params);
  return (
    <Suspense>
      <LoginScreen />
    </Suspense>
  );
}
