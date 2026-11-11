import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] whitespace-nowrap transition-[background-color,border-color,box-shadow,color,translate,opacity] duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring not-disabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'gloss bg-accent font-semibold text-accent-ink shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_1px_2px_rgba(0,0,0,.2)] hover:bg-accent-hover hover:text-accent-ink disabled:hover:bg-accent',
        secondary: 'border border-line-2 bg-surface font-medium text-fg hover:border-fg-3 hover:bg-surface-2 disabled:opacity-40',
        ghost: 'font-medium text-fg-2 hover:bg-surface-2 hover:text-fg',
        destructive:
          'bg-destructive font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.18)] hover:bg-destructive-hover focus-visible:outline-danger',
        'destructive-outline':
          'border border-danger bg-transparent font-medium text-danger hover:bg-danger-soft focus-visible:outline-danger',
      },
      size: {
        xs: 'h-8 px-3 text-[13px]',
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-10 px-3.5 text-sm',
        lg: 'h-11 px-4 text-[15px]',
        xl: 'h-12 px-[22px] text-base gap-2 focus-visible:outline-offset-3',
        nav: 'px-3.5 py-2 text-sm/5',
        icon: 'size-10 p-0',
      },
      block: {
        true: 'w-full',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        size: 'xl',
        className:
          'shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_1px_2px_rgba(0,0,0,.25),0_8px_24px_-8px_var(--glow)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_12px_32px_-8px_var(--glow)]',
      },
      {
        variant: 'primary',
        size: 'lg',
        className: 'shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_8px_24px_-10px_var(--glow)]',
      },
      {
        variant: 'primary',
        size: 'nav',
        className: 'hover:shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_4px_16px_-4px_var(--glow)]',
      },
      { variant: 'secondary', size: 'xl', className: 'shadow-(--shadow-card)' },
    ],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, block, asChild = false, type = 'button', ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
