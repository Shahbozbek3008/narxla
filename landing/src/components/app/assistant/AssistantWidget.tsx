'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';
import { EASE_OUT } from '@/lib/motion';
import { useAssistant } from '@/store/assistant';
import { AssistantPanel } from './AssistantPanel';
import { type RobotContext, RobotLauncher } from './RobotLauncher';

const MOBILE_QUERY = '(max-width: 767px)';

function contextOf(pathname: string): RobotContext {
  const [, section, page, id] = pathname.split('/');
  if (section !== 'app') return 'landing';
  if (page === 'calcs') return 'calcs';
  if (page === 'check') return 'check';
  if (page === 'estimates' && id) return 'estimate';
  return 'default';
}

export function AssistantWidget({ className }: { className?: string }) {
  const t = useTranslations('app.assistant');
  const reducedMotion = useReducedMotion();
  const { open, setOpen } = useAssistant();
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    const lockScroll = window.matchMedia(MOBILE_QUERY).matches;
    const previous = document.body.style.overflow;
    if (lockScroll) document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, setOpen]);

  return (
    <>
      <AnimatePresence>
        {!open && <RobotLauncher key="launcher" label={t('open')} context={contextOf(pathname)} onOpen={() => setOpen(true)} className={className} />}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="fixed inset-0 z-80 h-dvh origin-bottom-right overflow-hidden md:inset-auto md:right-6 md:bottom-6 md:h-[min(680px,calc(100dvh-48px))] md:w-[400px] md:rounded-3xl md:border md:border-line-2 md:shadow-(--shadow-elev)"
          >
            <AssistantPanel onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
