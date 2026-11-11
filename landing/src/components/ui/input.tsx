import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-[10px] border border-line-2 bg-surface-2 px-3.5 text-base tabular-nums outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-fg-3',
        'focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_var(--accent-soft)] focus-visible:outline-none',
        'aria-invalid:border-danger aria-invalid:shadow-[0_0_0_4px_var(--danger-soft)]',
        'read-only:border-line read-only:text-fg-2 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
