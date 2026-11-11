'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toggleTheme } from '@/lib/theme';

export function ThemeToggle() {
  const t = useTranslations('nav');

  return (
    <button
      type="button"
      className="grid size-9 place-items-center rounded-[10px] border border-line text-fg-2 transition-colors duration-150 hover:border-line-2 hover:bg-surface-2 hover:text-fg"
      aria-label={t('toggleTheme')}
      onClick={toggleTheme}
    >
      <Sun className="light:hidden" size={16} strokeWidth={1.5} aria-hidden />
      <Moon className="hidden light:block" size={16} strokeWidth={1.5} aria-hidden />
    </button>
  );
}
