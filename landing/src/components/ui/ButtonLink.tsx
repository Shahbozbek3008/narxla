import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';
import type { ComponentProps } from 'react';

type Variant = 'primary' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

type ButtonLinkProps = ComponentProps<'a'> & {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  block?: boolean;
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-[10px] whitespace-nowrap transition-[background-color,border-color,box-shadow,translate] duration-150 active:translate-y-px';

const VARIANT: Record<Variant, string> = {
  primary: 'gloss bg-accent font-semibold text-accent-ink hover:bg-accent-hover hover:text-accent-ink',
  secondary: 'border border-line-2 bg-surface font-medium text-fg hover:border-fg-3 hover:bg-surface-2',
};

const SIZE: Record<Size, string> = {
  sm: 'px-3.5 py-2 text-sm/5',
  md: 'h-11 px-4 text-[15px]',
  lg: 'h-12 px-[22px] text-base focus-visible:outline-offset-3',
};

const SHADOW: Record<Variant, Record<Size, string>> = {
  primary: {
    sm: 'shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_1px_2px_rgba(0,0,0,.2)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_4px_16px_-4px_var(--glow)]',
    md: 'shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_1px_2px_rgba(0,0,0,.2)]',
    lg: 'shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_1px_2px_rgba(0,0,0,.25),0_8px_24px_-8px_var(--glow)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,.3),0_12px_32px_-8px_var(--glow)]',
  },
  secondary: {
    sm: '',
    md: '',
    lg: 'shadow-(--shadow-card)',
  },
};

export function ButtonLink({
  variant = 'primary',
  size = 'lg',
  arrow = false,
  block = false,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <a className={clsx(BASE, VARIANT[variant], SIZE[size], SHADOW[variant][size], block && 'w-full', className)} {...rest}>
      {children}
      {arrow && <ArrowRight size={16} strokeWidth={1.75} aria-hidden />}
    </a>
  );
}
