import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

type Messages = Record<string, unknown>;

const isObject = (value: unknown): value is Messages =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const withFallback = (fallback: Messages, messages: Messages): Messages =>
  Object.fromEntries(
    Object.keys({ ...fallback, ...messages }).map((key) => {
      const own = messages[key];
      const base = fallback[key];
      return [key, isObject(own) && isObject(base) ? withFallback(base, own) : (own ?? base)];
    }),
  );

const loadMessages = async (locale: string): Promise<Messages> =>
  (await import(`../../messages/${locale}.json`)).default;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const messages = await loadMessages(locale);

  return {
    locale,
    messages:
      locale === routing.defaultLocale
        ? messages
        : withFallback(await loadMessages(routing.defaultLocale), messages),
  };
});
