'use client';

import { ArrowRight, ChevronRight, Moon, Sun, X } from 'lucide-react';
import { useLocale, useTranslations, type Locale } from 'next-intl';
import { useEffect, type CSSProperties } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { SheetClose, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useChangeLocale } from '@/hooks/useChangeLocale';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/hooks/useTheme';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { ANCHORS, toHash } from '@/lib/anchors';
import { LOCALE_LABELS } from '@/lib/locales';
import { routes } from '@/lib/routes';
import type { Theme } from '@/lib/theme';
import { NAV_ITEMS } from './navItems';

type MobileDrawerProps = {
  signedIn: boolean;
  onClose: () => void;
};

const LOCALE_OPTIONS = routing.locales.map((locale) => ({ value: locale, label: LOCALE_LABELS[locale].short }));

const ENTER = 'animate-in fill-mode-both duration-450 ease-(--ease-drawer)';
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

export function MobileDrawer({ signedIn, onClose }: MobileDrawerProps) {
  const t = useTranslations('drawer');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const changeLocale = useChangeLocale();
  const [theme, setTheme] = useTheme();
  const isDesktop = useMediaQuery('(min-width: 900px)');

  useEffect(() => {
    if (isDesktop) onClose();
  }, [isDesktop, onClose]);

  return (
    <SheetContent side="right">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line pr-3 pl-5">
        <SheetTitle className="sr-only">{t('menu')}</SheetTitle>
        <a href={toHash(ANCHORS.top)} onClick={onClose} aria-label={tNav('home')}>
          <Logo />
        </a>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" className="active:bg-surface-3" aria-label={tNav('closeMenu')}>
            <X size={18} strokeWidth={1.5} aria-hidden />
          </Button>
        </SheetClose>
      </div>

      <p className="pt-5 pr-2.5 pb-2 pl-5 text-xs/4 font-medium tracking-[0.06em] text-fg-3 uppercase">{t('menu')}</p>
      <nav className="flex flex-col gap-0.5 px-2.5">
        {NAV_ITEMS.map(({ key, anchor, icon: Icon }, index) => (
          <a
            key={key}
            href={toHash(anchor)}
            onClick={onClose}
            style={delay(60 + index * 40)}
            className={`${ENTER} fade-in-0 slide-in-from-right-4 flex items-center gap-3 rounded-xl p-2.5 transition-colors duration-150 hover:bg-surface-2 focus-visible:-outline-offset-2 active:bg-surface-3`}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-line-2 bg-surface-2 text-fg-2">
              <Icon size={17} strokeWidth={1.5} aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[15px]/[22px] font-medium text-fg">{tNav(key)}</span>
              <span className="text-[13px]/[18px] text-fg-3">{t(`hints.${key}`)}</span>
            </span>
            <ChevronRight className="shrink-0 text-fg-3" size={16} strokeWidth={1.5} aria-hidden />
          </a>
        ))}
      </nav>

      <div style={delay(220)} className={`${ENTER} fade-in-0 mx-5 mt-4 flex flex-col gap-3 border-t border-line pt-4`}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-fg-2">{t('theme')}</span>
          <Segmented<Theme>
            size="xs"
            label={t('theme')}
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: t('dark'), icon: <Moon size={14} strokeWidth={1.5} aria-hidden /> },
              { value: 'light', label: t('light'), icon: <Sun size={14} strokeWidth={1.5} aria-hidden /> },
            ]}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-fg-2">{t('language')}</span>
          <Segmented<Locale> size="xs" label={t('language')} value={locale} onChange={changeLocale} options={LOCALE_OPTIONS} />
        </div>
      </div>

      <div className="mt-auto overflow-hidden px-5 py-6">
        <div style={delay(260)} className={`${ENTER} fade-in-0 slide-in-from-bottom-3 flex flex-col gap-2.5`}>
          <Button asChild size="xl" block className="text-[15px]">
            <Link href={routes.newEstimate} onClick={onClose}>
              {tCommon('cta')}
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg" block>
            <Link href={signedIn ? routes.app : routes.login} onClick={onClose}>
              {signedIn ? tCommon('openApp') : tCommon('login')}
            </Link>
          </Button>
          <span className="mt-1.5 text-center text-xs/4 text-fg-3">{tCommon('noSignup')}</span>
        </div>
      </div>
    </SheetContent>
  );
}
