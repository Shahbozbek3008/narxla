'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';

const PRESETS = {
  up: { hidden: { opacity: 0, y: 22, filter: 'blur(6px)' }, duration: 0.95 },
  down: { hidden: { opacity: 0, y: -14 }, duration: 0.8 },
  rise: { hidden: { opacity: 0, y: 64, scale: 0.94, filter: 'blur(10px)' }, duration: 1.5 },
  pop: { hidden: { opacity: 0, y: 18, scale: 0.9, filter: 'blur(6px)' }, duration: 1 },
} as const;

const VISIBLE = { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } };

export type RevealKind = keyof typeof PRESETS;

type RevealProps = HTMLMotionProps<'div'> & {
  kind?: RevealKind;
  delay?: number;
};

export function Reveal({ kind = 'up', delay = 0, children, ...rest }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const { hidden, duration } = PRESETS[kind];
  const delaySeconds = delay / 1000;

  return (
    <motion.div
      initial={reducedMotion ? false : hidden}
      whileInView={VISIBLE}
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -6% 0px' }}
      transition={{
        duration,
        delay: delaySeconds,
        ease: EASE_OUT,
        opacity: { duration: duration * 0.7, delay: delaySeconds, ease: EASE_OUT },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
