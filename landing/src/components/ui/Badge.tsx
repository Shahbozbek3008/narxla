import clsx from 'clsx';
import type { ReactNode } from 'react';

export type BadgeTone = 'success' | 'neutral' | 'accent' | 'solid' | 'outline';

type BadgeProps = {
  tone?: BadgeTone;
  shape?: 'pill' | 'square';
  size?: 'xs' | 'sm';
  children: ReactNode;
};

const TONE: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success',
  neutral: 'bg-surface-3 text-fg-2',
  accent: 'bg-accent-soft text-accent-text',
  solid: 'gloss bg-accent text-accent-ink',
  outline: 'border border-line-2 text-fg-2',
};

const shapeClass = (shape: 'pill' | 'square', size: 'xs' | 'sm') => {
  if (size === 'sm') return 'rounded-full px-2.5 py-0.5 text-xs/4 font-semibold';
  if (shape === 'square') return 'rounded-md px-1.5 text-[11px]/5 font-semibold';
  return 'rounded-full px-2 text-[11px]/5 font-medium';
};

export function Badge({ tone = 'neutral', shape = 'pill', size = 'xs', children }: BadgeProps) {
  return (
    <span className={clsx('inline-flex shrink-0 items-center whitespace-nowrap', TONE[tone], shapeClass(shape, size))}>
      {children}
    </span>
  );
}
