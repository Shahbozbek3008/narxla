'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { RangeScale } from '@/components/shared/RangeScale';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FeatureCard, FeatureIntro } from './FeatureCard';
import { miniPanel } from './miniPanel';

const QUOTE_POSITION = 74;
const START_POSITION = 8;

export function PriceCheckCard() {
  const t = useTranslations('features.check');
  const axis = t.raw('axis') as string[];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reducedMotion = useReducedMotion();
  const settled = inView || Boolean(reducedMotion);

  return (
    <FeatureCard>
      <FeatureIntro title={t('title')} text={t('text')} />
      <div ref={ref} className={cn(miniPanel.root, 'mt-auto p-4')}>
        <p className="text-xs/4 text-fg-3">{t('label')}</p>
        <p className="mt-1 font-display text-[22px]/7 font-semibold">{t('price')}</p>
        <RangeScale className="mt-7" marker={settled ? QUOTE_POSITION : START_POSITION} label={t('you')} ring="surface-2" />
        <div className="mt-2 flex justify-between text-[11px]/4 text-fg-3">
          {axis.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <motion.span
          className="mt-3 inline-flex rounded-full bg-accent-soft px-2.5 py-1 text-xs/4 font-semibold text-accent-text"
          initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={settled ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, delay: reducedMotion ? 0 : 1.1, ease: EASE_OUT }}
        >
          {t('verdict')}
        </motion.span>
      </div>
    </FeatureCard>
  );
}
