'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Reveal } from '@/components/shared/Reveal';
import { EASE_OUT, stagger } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { DimensionsPreview, EstimatePreview, RoomPreview } from './StepPreviews';

export type Step = { title: string; text: string };

const PREVIEWS = [RoomPreview, DimensionsPreview, EstimatePreview];
const STEP_MS = 3200;

const stepCode = (index: number) => String(index + 1).padStart(2, '0');

export function StepsShowcase({ steps }: { steps: Step[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const last = steps.length - 1;

  useEffect(() => {
    if (!inView || paused || reducedMotion) return;
    const timer = setTimeout(() => setActive((current) => (current >= last ? 0 : current + 1)), STEP_MS);
    return () => clearTimeout(timer);
  }, [active, inView, paused, reducedMotion, last]);

  return (
    <div ref={ref} className="relative mt-[clamp(40px,5vw,64px)]" onPointerLeave={() => setPaused(false)}>
      <div className="absolute top-4 right-[16%] left-[16%] hidden h-px bg-line-2 md:block" aria-hidden>
        <motion.div
          className="h-full origin-left bg-[linear-gradient(90deg,var(--accent),var(--accent-hover))] shadow-[0_0_12px_var(--glow)]"
          initial={false}
          animate={{ scaleX: last === 0 ? 1 : active / last }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
        />
      </div>
      <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map((step, index) => {
          const Preview = PREVIEWS[index];
          const isActive = index === active;
          const isDone = index < active;
          return (
            <li
              key={step.title}
              onPointerEnter={() => {
                setPaused(true);
                setActive(index);
              }}
              onFocus={() => setActive(index)}
            >
              <Reveal delay={stagger(index, 120)} className="flex flex-col items-center gap-5 text-center">
                <span
                  className={cn(
                    'relative grid size-8 place-items-center rounded-full font-mono text-xs font-semibold transition-[background-color,color,box-shadow] duration-500',
                    isActive || isDone
                      ? 'gloss bg-accent text-accent-ink shadow-[0_0_0_6px_var(--bg),0_0_24px_var(--glow)]'
                      : 'bg-surface-3 text-fg shadow-[0_0_0_6px_var(--bg),inset_0_0_0_1px_var(--border-2)]',
                  )}
                >
                  {isDone ? <Check size={14} strokeWidth={2.5} aria-hidden /> : stepCode(index)}
                  {isActive && !reducedMotion && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-accent/30 [animation-duration:2s]" aria-hidden />
                  )}
                </span>
                <div>
                  <h3
                    className={cn(
                      'font-display text-xl/7 font-semibold tracking-[-0.02em] transition-colors duration-500',
                      !isActive && 'md:text-fg-2',
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px]/6 text-fg-2">{step.text}</p>
                </div>
                <div
                  aria-hidden
                  className={cn(
                    'spotlight sheen w-full rounded-2xl border bg-surface p-4 text-left text-[13px]/5 tabular-nums transition-[border-color,box-shadow,translate,opacity] duration-500',
                    isActive
                      ? 'border-accent/40 shadow-[0_0_0_4px_var(--accent-soft),var(--shadow-lift)] md:-translate-y-1'
                      : 'border-line shadow-(--shadow-card) md:opacity-75',
                  )}
                >
                  <Preview />
                </div>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
