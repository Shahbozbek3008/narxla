import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib';

const FIELD =
  'h-10 w-full rounded-[10px] border border-line-2 bg-bg-2 px-3 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-fg-3 focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-soft)] disabled:opacity-50';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(FIELD, className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<'select'>) {
  return <select className={cn(FIELD, 'cursor-pointer pr-8', className)} {...props} />;
}

type FieldProps = ComponentProps<'label'> & { label: string; hint?: string };

export function Field({ label, hint, className, children, ...props }: FieldProps) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1.5', className)} {...props}>
      <span className="text-[13px] font-medium text-fg-2">{label}</span>
      {children}
      {hint && <span className="text-xs text-fg-3">{hint}</span>}
    </label>
  );
}
