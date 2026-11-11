import type { Locale } from 'next-intl';
import { useCallback, useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';

export function useChangeLocale() {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  return useCallback(
    (locale: Locale) => startTransition(() => router.replace(pathname, { locale, scroll: false })),
    [router, pathname],
  );
}
