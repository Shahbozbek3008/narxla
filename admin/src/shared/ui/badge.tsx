import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger' | 'outline';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-3 text-fg-2',
  accent: 'bg-accent-soft text-accent-text',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  outline: 'border border-line-2 text-fg-3',
};

type BadgeProps = ComponentProps<'span'> & { tone?: BadgeTone; dot?: boolean };

export function Badge({ tone = 'neutral', dot, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs/[18px] font-medium whitespace-nowrap', TONES[tone], className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
