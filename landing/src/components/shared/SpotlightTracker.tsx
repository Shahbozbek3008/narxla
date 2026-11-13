'use client';

import { useEffect } from 'react';
import { useFinePointer } from '@/hooks/useFinePointer';

const SELECTOR = '.spotlight';

export function SpotlightTracker() {
  const finePointer = useFinePointer();

  useEffect(() => {
    if (!finePointer) return;
    let frame = 0;
    let pending: PointerEvent | null = null;

    const paint = () => {
      frame = 0;
      if (!pending || !(pending.target instanceof Element)) return;
      const card = pending.target.closest<HTMLElement>(SELECTOR);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${pending.clientX - rect.left}px`);
      card.style.setProperty('--my', `${pending.clientY - rect.top}px`);
    };

    const onMove = (event: PointerEvent) => {
      pending = event;
      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [finePointer]);

  return null;
}
