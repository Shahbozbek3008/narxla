'use client';

import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useFinePointer } from '@/hooks/useFinePointer';
import { cn } from '@/lib/utils';

const SPRING = { stiffness: 120, damping: 24, mass: 0.6 };

type PointerGlowProps = {
  size?: number;
  className?: string;
};

export function PointerGlow({ size = 560, className }: PointerGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const x = useSpring(useMotionValue(-size), SPRING);
  const y = useSpring(useMotionValue(-size), SPRING);
  const opacity = useSpring(0, SPRING);
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${x}px ${y}px, var(--glow), transparent 60%)`;

  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!enabled || !host) return;

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      x.set(event.clientX - rect.left);
      y.set(event.clientY - rect.top);
      opacity.set(1);
    };
    const onLeave = () => opacity.set(0);

    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    return () => {
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, x, y, opacity]);

  return (
    <motion.div
      ref={ref}
      aria-hidden
      className={cn('pointer-events-none absolute inset-0', className)}
      style={enabled ? { background, opacity } : { opacity: 0 }}
    />
  );
}
