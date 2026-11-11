import { ChevronDown } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function NativeSelect({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <span className={cn('relative flex w-full max-w-[360px]', className)}>
      <select
        data-slot="native-select"
        className="h-10 w-full cursor-pointer appearance-none rounded-[10px] border border-line-2 bg-surface-2 pr-9 pl-3 text-sm text-fg outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_var(--accent-soft)] focus-visible:outline-none"
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-3 right-3 text-fg-3"
        size={16}
        strokeWidth={1.5}
        aria-hidden
      />
    </span>
  );
}

export { NativeSelect };
