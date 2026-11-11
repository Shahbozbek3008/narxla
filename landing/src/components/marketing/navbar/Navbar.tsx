'use client';

import { motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Burger } from '@/components/icons';
import { LocaleMenu } from '@/components/locale/LocaleMenu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { Logo } from '@/components/ui/Logo';
import { ANCHORS, toHash } from '@/lib/anchors';
import { appLinks } from '@/lib/config';
import { EASE_OUT } from '@/lib/motion';
import { MobileDrawer } from './MobileDrawer';
import { NAV_ITEMS } from './navItems';

const SCROLL_THRESHOLD = 8;

export function Navbar() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setScrolled(scrollY.get() > SCROLL_THRESHOLD), [scrollY]);
  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > SCROLL_THRESHOLD));

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <motion.header
        data-scrolled={scrolled}
        className="sticky top-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-250 data-[scrolled=true]:border-line data-[scrolled=true]:bg-nav data-[scrolled=true]:backdrop-blur-[16px] data-[scrolled=true]:backdrop-saturate-[160%]"
        initial={reducedMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-[clamp(8px,3vw,32px)] px-[clamp(16px,5vw,24px)]">
          <a href={toHash(ANCHORS.top)} className="flex shrink-0" aria-label={t('home')}>
            <Logo />
          </a>
          <nav className="hidden gap-1 text-sm/5 md:flex">
            {NAV_ITEMS.map(({ key, anchor }) => (
              <a
                key={key}
                href={toHash(anchor)}
                className="rounded-lg px-3 py-1.5 text-fg-2 transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
              >
                {t(key)}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <LocaleMenu variant="button" />
              <ThemeToggle />
              <a
                href={appLinks.login}
                className="rounded-[10px] px-3.5 py-2 text-sm/5 font-medium text-fg-2 transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
              >
                {tCommon('login')}
              </a>
            </div>
            <ButtonLink href={appLinks.newEstimate} size="sm">
              {tCommon('cta')}
            </ButtonLink>
            <button
              type="button"
              className="-mr-1.5 grid size-10 place-items-center rounded-[10px] text-fg transition-colors duration-150 hover:bg-surface-2 active:bg-surface-3 md:hidden"
              aria-label={t('openMenu')}
              aria-expanded={menuOpen}
              onClick={openMenu}
            >
              <Burger />
            </button>
          </div>
        </div>
      </motion.header>
      <MobileDrawer open={menuOpen} onClose={closeMenu} />
    </>
  );
}
