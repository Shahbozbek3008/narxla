'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LogoMark } from '@/components/brand/Logo';
import { Link, usePathname } from '@/i18n/navigation';
import { routes } from '@/lib/routes';
import { toggleTheme } from '@/lib/theme';
import { screenKey } from './navigation';

export function TopBar() {
  const t = useTranslations('app');
  const pathname = usePathname();

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-line px-4 md:hidden">
      <Link href={routes.estimates} aria-label={t('nav.estimates')}>
        <LogoMark size={26} />
      </Link>
      <span className="flex-1 font-display text-base font-semibold tracking-[-0.02em]">
        {t(`titles.${screenKey(pathname)}`)}
      </span>
      <button
        type="button"
        aria-label={t('theme')}
        onClick={toggleTheme}
        className="grid size-10 place-items-center rounded-[10px] text-fg-2 active:bg-surface-2"
      >
        <Sun className="light:hidden" size={18} strokeWidth={1.5} aria-hidden />
        <Moon className="hidden light:block" size={18} strokeWidth={1.5} aria-hidden />
      </button>
    </header>
  );
}
