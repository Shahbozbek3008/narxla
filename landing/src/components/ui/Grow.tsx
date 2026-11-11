'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';

type GrowProps = {
  delay?: number;
  className?: string;
};

export function Grow({ delay = 0, className }: GrowProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      style={{ originX: 0 }}
      initial={reducedMotion ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 1.4, delay: delay / 1000, ease: EASE_OUT }}
    />
  );
}
