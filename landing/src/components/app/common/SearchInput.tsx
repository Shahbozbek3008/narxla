import { Search } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SearchInputProps = Omit<ComponentProps<'input'>, 'size'> & {
  size?: 'sm' | 'md';
  wrapperClassName?: string;
};

const SIZE = {
  sm: { input: 'h-10 rounded-lg pr-2.5 pl-[30px] text-base sm:h-8 sm:text-[13px] focus-visible:shadow-[0_0_0_3px_var(--accent-soft)]', icon: 'top-[13px] left-2.5 sm:top-[9px]', px: 14 },
  md: { input: 'h-11 bg-surface pr-3 pl-9 text-base sm:h-10 sm:text-sm', icon: 'top-3.5 left-3 sm:top-3', px: 16 },
};

export function SearchInput({ size = 'md', wrapperClassName, className, ...props }: SearchInputProps) {
  const style = SIZE[size];

  return (
    <span className={cn('relative block', wrapperClassName)}>
      <Search className={cn('pointer-events-none absolute text-fg-3', style.icon)} size={style.px} strokeWidth={1.5} aria-hidden />
      <Input type="search" className={cn(style.input, '[&::-webkit-search-cancel-button]:hidden', className)} {...props} />
    </span>
  );
}
