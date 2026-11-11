'use client';

import clsx from 'clsx';
import { Check, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { RangeScale } from '@/components/ui/RangeScale';
import { Reveal } from '@/components/ui/Reveal';
import { PhoneMockup } from './PhoneMockup';
import { ShotDashboard } from './ShotDashboard';

const MAX_TILT = 10;
const TILT_SCROLL_RATIO = 30;
const TILT_SCALE_RATIO = 0.003;

const FLOAT = 'absolute z-2 hidden lg:block';
const FLOAT_CARD = 'sheen border border-line-2 bg-surface text-left tabular-nums shadow-(--shadow-elev)';
const FLOAT_ICON = 'grid size-8 shrink-0 place-items-center';

export function ProductShot() {
  const t = useTranslations('shot');
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const rotateX = useTransform(scrollY, (y) => (reducedMotion ? 0 : Math.max(0, MAX_TILT - y / TILT_SCROLL_RATIO)));
  const scale = useTransform(rotateX, (tilt) => 1 - tilt * TILT_SCALE_RATIO);
  const floatSlow = useTransform(scrollY, (y) => (reducedMotion ? 0 : -y * 0.08));
  const floatFast = useTransform(scrollY, (y) => (reducedMotion ? 0 : -y * 0.16));

  return (
    <Reveal
      kind="rise"
      delay={480}
      className="relative mx-auto mt-[clamp(48px,7vw,80px)] max-w-[1248px] px-[clamp(20px,5vw,24px)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[12%_10%_-6%_10%] bg-[radial-gradient(ellipse_at_center,var(--glow),transparent_65%)] blur-[40px]"
      />

      <div className="relative hidden perspective-[2400px] sm:block" role="img" aria-label={t('alt')}>
        <motion.div
          className="origin-top rounded-[20px] bg-linear-to-b from-line-2 to-line p-1.5 shadow-(--shadow-elev)"
          style={{ rotateX, scale }}
        >
          <ShotDashboard />
        </motion.div>
      </div>

      <Reveal kind="pop" delay={1150} className={clsx(FLOAT, 'bottom-16 left-0 w-72')} aria-hidden>
        <motion.div className={clsx(FLOAT_CARD, 'rounded-2xl p-4')} style={{ y: floatSlow }}>
          <div className="flex items-center gap-2.5">
            <span className={clsx(FLOAT_ICON, 'rounded-[9px] bg-accent-soft text-accent-text')}>
              <ShieldCheck size={16} strokeWidth={1.5} />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px]/[18px] font-semibold">{t('floatCheck.title')}</span>
              <span className="text-xs/4 text-fg-3">{t('floatCheck.subtitle')}</span>
            </span>
          </div>
          <RangeScale className="mt-4" marker={74} size="sm" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-fg-3">{t('floatCheck.market')}</span>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs/4 font-semibold text-accent-text">
              {t('floatCheck.delta')}
            </span>
          </div>
        </motion.div>
      </Reveal>

      <Reveal kind="pop" delay={1300} className={clsx(FLOAT, 'top-30 right-0')} aria-hidden>
        <motion.div
          className={clsx(FLOAT_CARD, 'flex items-center gap-3 rounded-[14px] py-3 pr-4 pl-3')}
          style={{ y: floatFast }}
        >
          <span className={clsx(FLOAT_ICON, 'rounded-full bg-success-soft text-success')}>
            <Check size={16} strokeWidth={2} />
          </span>
          <span className="flex flex-col">
            <span className="text-[13px]/[18px] font-semibold">{t('floatSaved.title')}</span>
            <span className="text-xs/4 text-fg-3">{t('floatSaved.subtitle')}</span>
          </span>
        </motion.div>
      </Reveal>

      <PhoneMockup />
    </Reveal>
  );
}
