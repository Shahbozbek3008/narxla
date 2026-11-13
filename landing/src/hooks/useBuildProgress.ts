import { useInView } from 'framer-motion';
import { type RefObject, useEffect, useState } from 'react';
import { useCountUp } from './useCountUp';

export function useBuildProgress(ref: RefObject<Element | null>, delayMs: number, durationMs: number) {
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const timer = setTimeout(() => setStarted(true), delayMs);
    return () => clearTimeout(timer);
  }, [inView, delayMs]);

  return { started, progress: useCountUp(started, durationMs) };
}
