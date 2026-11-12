import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

type AvatarProps = {
  initials: string;
  size?: 32 | 36 | 48 | 64;
  className?: string;
};

const SIZE = {
  32: { box: 'size-8 text-xs', icon: 15 },
  36: { box: 'size-9 text-[13px]', icon: 16 },
  48: { box: 'size-12 text-[15px]', icon: 20 },
  64: { box: 'size-16 text-xl', icon: 26 },
};

export function Avatar({ initials, size = 32, className }: AvatarProps) {
  const { box, icon } = SIZE[size];

  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full bg-[#3A3F4A] font-semibold text-[#EDEEF1]', box, className)}
    >
      {initials || <User size={icon} strokeWidth={1.75} />}
    </span>
  );
}
