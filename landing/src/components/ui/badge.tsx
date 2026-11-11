import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap', {
  variants: {
    tone: {
      success: 'bg-success-soft text-success',
      neutral: 'bg-surface-3 text-fg-2',
      accent: 'bg-accent-soft text-accent-text',
      solid: 'gloss bg-accent text-accent-ink',
      outline: 'border border-line-2 text-fg-2',
    },
    shape: {
      pill: 'rounded-full px-2 text-[11px]/5 font-medium',
      square: 'rounded-md px-1.5 text-[11px]/[18px] font-semibold',
      tag: 'rounded-md px-2 text-xs/[22px] font-semibold',
      chip: 'rounded-full px-2.5 py-0.5 text-xs/4 font-semibold',
      status: 'rounded-full px-2.5 text-xs/[22px] font-medium',
    },
  },
  defaultVariants: {
    tone: 'neutral',
    shape: 'pill',
  },
});

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { dot?: boolean };

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

function Badge({ className, tone, shape, dot = false, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, shape }), className)} {...props}>
      {dot && <span className={cn('shrink-0 rounded-full bg-current', shape === 'status' ? 'size-1.5' : 'size-[5px]')} aria-hidden />}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
