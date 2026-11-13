'use client';

import { motion, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const SPRING = { stiffness: 110, damping: 22, mass: 0.7 };

type AnimatedValueProps = {
  value: number;
  format: (value: number) => string;
  className?: string;
};

export function AnimatedValue({ value, format, className }: AnimatedValueProps) {
  const reducedMotion = useReducedMotion();
  const spring = useSpring(value, SPRING);
  const text = useTransform(spring, format);

  useEffect(() => {
    if (reducedMotion) spring.jump(value);
    else spring.set(value);
  }, [spring, value, reducedMotion]);

  return <motion.span className={className}>{text}</motion.span>;
}
