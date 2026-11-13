'use client';

import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Burger } from '@/components/icons';
import { LocaleMenu } from '@/components/locale/LocaleMenu';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';
import { useActiveSection } from '@/hooks/useActiveSection';
import { Link } from '@/i18n/navigation';
import { ANCHORS, toHash } from '@/lib/anchors';
import { EASE_OUT } from '@/lib/motion';
import { routes } from '@/lib/routes';
import { useAuth } from '@/lib/api/queries';
import { cn } from '@/lib/utils';
import { MobileDrawer } from './MobileDrawer';
import { NAV_ITEMS } from './navItems';

const SCROLL_THRESHOLD = 8;
const SECTION_IDS = NAV_ITEMS.map(({ anchor }) => anchor);
const PROGRESS_SPRING = { stiffness: 140, damping: 30, mass: 0.4 };

export function Navbar() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const reducedMotion = useReducedMotion();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, PROGRESS_SPRING);
  const activeSection = useActiveSection(SECTION_IDS);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const signedIn = useAuth().status === 'authenticated';
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => setScrolled(scrollY.get() > SCROLL_THRESHOLD), [scrollY]);
  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > SCROLL_THRESHOLD));

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <motion.header
        data-scrolled={scrolled}
        className="sticky top-0 z-50 border-b border-transparent transition-[background-color,border-color] duration-250 data-[scrolled=true]:border-line data-[scrolled=true]:bg-nav data-[scrolled=true]:backdrop-blur-[16px] data-[scrolled=true]:backdrop-saturate-[160%]"
        initial={reducedMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] transition-[height] duration-300 ease-[cubic-bezier(.16,1,.3,1)] in-data-[scrolled=true]:h-14 items-center gap-[clamp(8px,3vw,32px)] px-[clamp(16px,5vw,24px)]">
          <a href={toHash(ANCHORS.top)} className="flex shrink-0" aria-label={t('home')}>
            <Logo />
          </a>
          <nav className="hidden gap-1 text-sm/5 md:flex">
            {NAV_ITEMS.map(({ key, anchor }) => {
              const active = activeSection === anchor;
              return (
                <a
                  key={key}
                  href={toHash(anchor)}
                  aria-current={active ? 'location' : undefined}
                  className={cn(
                    'relative rounded-lg px-3 py-1.5 transition-colors duration-200 hover:text-fg',
                    active ? 'text-fg' : 'text-fg-2',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-surface-2 shadow-[inset_0_0_0_1px_var(--border)]"
                      transition={{ duration: 0.45, ease: EASE_OUT }}
                    />
                  )}
                  <span className="relative">{t(key)}</span>
                </a>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <LocaleMenu variant="button" />
              <ThemeToggle />
              <Button asChild variant="ghost" size="nav">
                {signedIn ? (
                  <Link href={routes.app}>
                    {tCommon('openApp')}
                    <ArrowRight size={14} strokeWidth={1.75} aria-hidden />
                  </Link>
                ) : (
                  <Link href={routes.login}>{tCommon('login')}</Link>
                )}
              </Button>
            </div>
            <Button asChild size="nav">
              <Link href={routes.newEstimate}>{tCommon('cta')}</Link>
            </Button>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="-mr-1.5 text-fg active:bg-surface-3 md:hidden"
                aria-label={t('openMenu')}
              >
                <Burger />
              </Button>
            </SheetTrigger>
          </div>
        </div>
        <motion.div
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-[linear-gradient(90deg,transparent,var(--accent)_30%,var(--accent-hover))] opacity-0 transition-opacity duration-300 in-data-[scrolled=true]:opacity-100"
          style={{ scaleX: progress }}
        />
      </motion.header>
      <MobileDrawer signedIn={signedIn} onClose={closeMenu} />
    </Sheet>
  );
}
