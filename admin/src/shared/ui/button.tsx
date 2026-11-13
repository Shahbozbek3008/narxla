import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent font-semibold text-accent-ink hover:bg-accent-hover shadow-[inset_0_1px_0_rgba(255,255,255,.25)]',
  secondary: 'border border-line-2 bg-surface font-medium text-fg hover:border-fg-3 hover:bg-surface-2',
  ghost: 'font-medium text-fg-2 hover:bg-surface-2 hover:text-fg',
  danger: 'font-medium text-danger hover:bg-danger-soft',
};

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-8 gap-1.5 rounded-lg px-2.5 text-[13px]',
  sm: 'h-9 gap-2 rounded-[10px] px-3.5 text-sm',
  md: 'h-10 gap-2 rounded-[10px] px-4 text-sm',
};

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
};

export function Button({ variant = 'primary', size = 'sm', block, className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-[background-color,border-color,color,scale] duration-150 active:scale-[.97] disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...props}
    />
  );
}
