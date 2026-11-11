'use client';

import clsx from 'clsx';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useChangeLocale } from '@/hooks/useChangeLocale';
import { routing } from '@/i18n/routing';
import { LOCALE_LABELS } from '@/lib/locales';

type Variant = 'button' | 'link';
type Placement = 'bottom' | 'top';

type LocaleMenuProps = {
  variant: Variant;
  placement?: Placement;
};

const TRIGGER: Record<Variant, string> = {
  button:
    'flex h-9 items-center gap-1.5 rounded-[10px] border border-line px-2.5 text-[13px] font-medium text-fg-2 transition-colors duration-150 hover:border-line-2 hover:bg-surface-2 hover:text-fg aria-expanded:border-line-2 aria-expanded:bg-surface-2 aria-expanded:text-fg',
  link: 'inline-flex items-center gap-1 text-[13px]/5 text-fg-3 transition-colors duration-150 hover:text-fg',
};

const MENU_PLACEMENT: Record<Placement, string> = {
  bottom: 'top-[calc(100%+8px)] origin-top-right -translate-y-1.5',
  top: 'bottom-[calc(100%+8px)] origin-bottom-right translate-y-1.5',
};

export function LocaleMenu({ variant, placement = 'bottom' }: LocaleMenuProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const changeLocale = useChangeLocale();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const current = LOCALE_LABELS[locale];

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={TRIGGER[variant]}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('language')}
        onClick={() => setOpen((value) => !value)}
      >
        {variant === 'button' ? (
          <>
            <Globe size={16} strokeWidth={1.5} aria-hidden />
            {current.short}
          </>
        ) : (
          <>
            {current.name}
            <ChevronDown size={14} strokeWidth={1.5} aria-hidden />
          </>
        )}
      </button>
      <div
        role="menu"
        data-open={open}
        inert={!open}
        className={clsx(
          'sheen invisible absolute right-0 z-60 min-w-[168px] scale-[.97] rounded-[14px] border border-line-2 bg-surface-2 p-1.5 opacity-0 shadow-(--shadow-elev)',
          '[transition:opacity_.2s_ease,translate_.35s_var(--ease-out),scale_.35s_var(--ease-out),visibility_0s_linear_.2s]',
          'data-[open=true]:visible data-[open=true]:translate-y-0 data-[open=true]:scale-100 data-[open=true]:opacity-100 data-[open=true]:delay-0',
          MENU_PLACEMENT[placement],
        )}
      >
        {routing.locales.map((item) => (
          <button
            key={item}
            type="button"
            role="menuitemradio"
            aria-checked={item === locale}
            lang={item}
            className="flex h-9 w-full items-center justify-between gap-2.5 rounded-lg px-2.5 text-left text-sm text-fg transition-colors duration-[120ms] hover:bg-surface-3 focus-visible:-outline-offset-2"
            onClick={() => {
              setOpen(false);
              changeLocale(item);
            }}
          >
            {LOCALE_LABELS[item].name}
            {item === locale && <Check size={14} strokeWidth={2} aria-hidden />}
          </button>
        ))}
      </div>
    </div>
  );
}
