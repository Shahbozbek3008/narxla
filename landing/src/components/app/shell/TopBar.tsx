'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { LogoMark } from '@/components/brand/Logo';
import { Link, usePathname } from '@/i18n/navigation';
import { BRAND_NAME } from '@/lib/config';
import { routes } from '@/lib/routes';
import { toggleTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { screenKey } from './navigation';

const TITLE_REVEAL_OFFSET = 72;

function useScrolledPast(offset: number) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [offset]);

  return scrolled;
}

const LABEL = 'absolute inset-0 flex items-center truncate font-display text-base font-semibold tracking-[-0.02em] transition-[opacity,translate] duration-250 ease-(--ease-out-expo)';

export function TopBar() {
  const t = useTranslations('app');
  const pathname = usePathname();
  const scrolled = useScrolledPast(TITLE_REVEAL_OFFSET);

  return (
    <header className="glass sticky top-0 z-40 flex h-14 items-center gap-1 border-b border-line pr-2 pl-2 md:hidden">
      <Link
        href={routes.estimates}
        aria-label={t('nav.estimates')}
        className="grid size-10 shrink-0 place-items-center rounded-[10px] active:bg-surface-2"
      >
        <LogoMark size={26} />
      </Link>
      <span className="relative h-6 min-w-0 flex-1">
        <span aria-hidden={scrolled} className={cn(LABEL, scrolled && '-translate-y-2 opacity-0')}>
          {BRAND_NAME}
        </span>
        <span aria-hidden={!scrolled} className={cn(LABEL, !scrolled && 'translate-y-2 opacity-0')}>
          {t(`titles.${screenKey(pathname)}`)}
        </span>
      </span>
      <button
        type="button"
        aria-label={t('theme')}
        onClick={toggleTheme}
        className="grid size-10 shrink-0 place-items-center rounded-[10px] text-fg-2 active:bg-surface-2"
      >
        <Sun className="light:hidden" size={18} strokeWidth={1.5} aria-hidden />
        <Moon className="hidden light:block" size={18} strokeWidth={1.5} aria-hidden />
      </button>
    </header>
  );
}
