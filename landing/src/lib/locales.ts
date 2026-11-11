import type { Locale } from 'next-intl';

export const LOCALE_LABELS: Record<Locale, { name: string; short: string }> = {
  uz: { name: 'O‘zbekcha', short: 'UZ' },
  ru: { name: 'Русский', short: 'RU' },
  en: { name: 'English', short: 'EN' },
};
