'use client';

import { Check, ShieldCheck } from 'lucide-react';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { RangeScale } from '@/components/shared/RangeScale';
import { Reveal } from '@/components/shared/Reveal';
import { useFinePointer } from '@/hooks/useFinePointer';
import { fmt, mln } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PhoneMockup } from './PhoneMockup';
import { ShotDashboard } from './ShotDashboard';
import { DEMO_CHECK, useDemoShot } from './useDemoShot';

const MAX_TILT = 10;
const TILT_SCROLL_RATIO = 30;
const TILT_SCALE_RATIO = 0.003;
const POINTER_TILT_X = 3;
const POINTER_TILT_Y = 5;
const POINTER_SPRING = { stiffness: 90, damping: 20, mass: 0.8 };

const FLOAT = 'absolute z-2 hidden lg:block';
const FLOAT_CARD = 'sheen border border-line-2 bg-surface text-left tabular-nums shadow-(--shadow-elev)';
const FLOAT_ICON = 'grid size-8 shrink-0 place-items-center';

export function ProductShot() {
  const t = useTranslations('shot');
  const tApp = useTranslations('app');
  const { check, delta } = useDemoShot();
  const reducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const finePointer = useFinePointer();
  const pointerX = useSpring(useMotionValue(0), POINTER_SPRING);
  const pointerY = useSpring(useMotionValue(0), POINTER_SPRING);

  useEffect(() => {
    if (!finePointer || reducedMotion) return;
    const onMove = (event: PointerEvent) => {
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [finePointer, reducedMotion, pointerX, pointerY]);

  const scrollTilt = useTransform(scrollY, (y) => (reducedMotion ? 0 : Math.max(0, MAX_TILT - y / TILT_SCROLL_RATIO)));
  const scale = useTransform(scrollTilt, (tilt) => 1 - tilt * TILT_SCALE_RATIO);
  const rotateX = useTransform([scrollTilt, pointerY], ([tilt, py]: number[]) => tilt - py * POINTER_TILT_X);
  const rotateY = useTransform(pointerX, (px) => px * POINTER_TILT_Y);
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
          style={{ rotateX, rotateY, scale }}
        >
          <ShotDashboard />
        </motion.div>
      </div>

      <Reveal kind="pop" delay={1150} className={cn(FLOAT, 'bottom-16 left-0 w-72')} aria-hidden>
        <motion.div className={cn(FLOAT_CARD, 'rounded-2xl p-4')} style={{ y: floatSlow }}>
          <div className="flex items-center gap-2.5">
            <span className={cn(FLOAT_ICON, 'rounded-[9px] bg-accent-soft text-accent-text')}>
              <ShieldCheck size={16} strokeWidth={1.5} />
            </span>
            <span className="flex flex-col">
              <span className="text-[13px]/[18px] font-semibold">{t('floatCheck.title')}</span>
              <span className="text-xs/4 text-fg-3">
                {t('floatCheck.subtitle', { work: tApp(`labour.${DEMO_CHECK.code}`), price: fmt(DEMO_CHECK.quote) })}
              </span>
            </span>
          </div>
          <RangeScale className="mt-4" marker={check.markerPct} size="sm" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-fg-3">{t('floatCheck.market', { from: mln(check.lo), to: mln(check.hi) })}</span>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs/4 font-semibold text-accent-text">
              {delta > 0 ? '+' : ''}
              {delta}%
            </span>
          </div>
        </motion.div>
      </Reveal>

      <Reveal kind="pop" delay={1300} className={cn(FLOAT, 'top-14 right-0')} aria-hidden>
        <motion.div
          className={cn(FLOAT_CARD, 'flex items-center gap-3 rounded-[14px] py-3 pr-4 pl-3')}
          style={{ y: floatFast }}
        >
          <span className={cn(FLOAT_ICON, 'rounded-full bg-success-soft text-success')}>
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
