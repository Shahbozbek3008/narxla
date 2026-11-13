'use client';

import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { useCountUp } from '@/hooks/useCountUp';

const NUMBER = /\d+/;
const DURATION_MS = 1600;

export function CountUpText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const progress = useCountUp(inView, DURATION_MS);
  const match = NUMBER.exec(text);
  const value = match ? text.replace(NUMBER, String(Math.round(Number(match[0]) * progress))) : text;

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{value}</span>
    </span>
  );
}
