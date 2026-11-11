'use client';

import { ChevronRight, Moon, Sun, X } from 'lucide-react';
import { useLocale, useTranslations, type Locale } from 'next-intl';
import { useEffect, useRef, type CSSProperties } from 'react';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Logo } from '@/components/ui/Logo';
import { Segmented } from '@/components/ui/Segmented';
import { useChangeLocale } from '@/hooks/useChangeLocale';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useTheme } from '@/hooks/useTheme';
import { routing } from '@/i18n/routing';
import { ANCHORS, toHash } from '@/lib/anchors';
import { appLinks } from '@/lib/config';
import { LOCALE_LABELS } from '@/lib/locales';
import type { Theme } from '@/lib/theme';
import { NAV_ITEMS } from './navItems';

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
};

const LOCALE_OPTIONS = routing.locales.map((locale) => ({ value: locale, label: LOCALE_LABELS[locale].short }));

const itemDelay = (index: number) => ({ '--delay': `${60 + index * 40}ms` }) as CSSProperties;

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const t = useTranslations('drawer');
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const changeLocale = useChangeLocale();
  const [theme, setTheme] = useTheme();
  const isDesktop = useMediaQuery('(min-width: 900px)');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && isDesktop) onClose();
  }, [open, isDesktop, onClose]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    root.style.overflow = 'hidden';
    closeButtonRef.current?.focus({ preventScroll: true });
    document.addEventListener('keydown', handleKey);
    return () => {
      root.style.overflow = '';
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  return (
    <div
      data-open={open}
      aria-hidden={!open}
      inert={!open}
      className="group pointer-events-none invisible fixed inset-0 z-100 transition-[visibility] delay-450 duration-0 data-[open=true]:pointer-events-auto data-[open=true]:visible data-[open=true]:delay-0"
    >
      <div
        className="absolute inset-0 bg-overlay opacity-0 backdrop-blur-[6px] transition-opacity duration-350 group-data-[open=true]:opacity-100"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t('menu')}
        className="sheen absolute inset-y-0 right-0 flex w-[min(340px,88vw)] translate-x-[102%] flex-col overflow-x-hidden overflow-y-auto border-l border-line-2 bg-surface shadow-(--shadow-elev) transition-transform duration-450 ease-(--ease-drawer) group-data-[open=true]:translate-x-0"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line pr-3 pl-5">
          <a href={toHash(ANCHORS.top)} onClick={onClose} aria-label={tNav('home')}>
            <Logo />
          </a>
          <button
            ref={closeButtonRef}
            type="button"
            className="grid size-10 place-items-center rounded-[10px] text-fg-2 transition-colors duration-150 hover:bg-surface-2 hover:text-fg active:bg-surface-3"
            aria-label={tNav('closeMenu')}
            onClick={onClose}
          >
            <X size={18} strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        <p className="pt-5 pr-2.5 pb-2 pl-5 text-xs/4 font-medium tracking-[0.06em] text-fg-3 uppercase">{t('menu')}</p>
        <nav className="flex flex-col gap-0.5 px-2.5">
          {NAV_ITEMS.map(({ key, anchor, icon: Icon }, index) => (
            <a
              key={key}
              href={toHash(anchor)}
              onClick={onClose}
              style={itemDelay(index)}
              className="flex translate-x-4 items-center gap-3 rounded-xl p-2.5 opacity-0 [transition:opacity_.35s_ease_var(--delay),translate_.45s_var(--ease-drawer)_var(--delay),background-color_.15s] hover:bg-surface-2 focus-visible:-outline-offset-2 active:bg-surface-3 group-data-[open=true]:translate-x-0 group-data-[open=true]:opacity-100"
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

        <div className="mx-5 mt-4 flex flex-col gap-3 border-t border-line pt-4 opacity-0 transition-opacity delay-220 duration-350 group-data-[open=true]:opacity-100">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-fg-2">{t('theme')}</span>
            <Segmented<Theme>
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
            <Segmented<Locale> label={t('language')} value={locale} onChange={changeLocale} options={LOCALE_OPTIONS} />
          </div>
        </div>

        <div className="mt-auto overflow-hidden px-5 py-6">
          <div className="flex translate-y-3 flex-col gap-2.5 opacity-0 [transition:opacity_.35s_ease_260ms,translate_.45s_var(--ease-drawer)_260ms] group-data-[open=true]:translate-y-0 group-data-[open=true]:opacity-100">
            <ButtonLink href={appLinks.newEstimate} size="lg" arrow block onClick={onClose}>
              {tCommon('cta')}
            </ButtonLink>
            <ButtonLink href={appLinks.login} variant="secondary" size="md" block onClick={onClose}>
              {tCommon('login')}
            </ButtonLink>
            <span className="mt-1.5 text-center text-xs/4 text-fg-3">{tCommon('noSignup')}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
