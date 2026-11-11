import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from './routing';

export type LocaleParams<T extends object = object> = Promise<{ locale: string } & T>;

export async function resolveLocale<T extends object>(params: LocaleParams<T>) {
  const resolved = await params;
  const { locale } = resolved;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return { ...resolved, locale };
}
