'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Fragment } from 'react';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';

const WORD: Variants = {
  hidden: { opacity: 0, y: '0.4em', filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.85, ease: EASE_OUT } },
};

const WORD_STAGGER_S = 0.055;

type WordsRevealProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
};

export function WordsReveal({ text, className, wordClassName, delay = 0 }: WordsRevealProps) {
  const reducedMotion = useReducedMotion();
  const words = text.split(' ');

  return (
    <motion.h2
      className={className}
      initial={reducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: WORD_STAGGER_S, delayChildren: delay / 1000 }}
    >
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <motion.span variants={WORD} className={cn('-mb-[0.12em] inline-block pb-[0.12em]', wordClassName)}>
            {word}
          </motion.span>
          {index < words.length - 1 && ' '}
        </Fragment>
      ))}
    </motion.h2>
  );
}
