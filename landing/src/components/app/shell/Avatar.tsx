import { cn } from '@/lib/utils';

type AvatarProps = {
  initials: string;
  size?: 32 | 36 | 48;
};

const SIZE = {
  32: 'size-8 text-xs',
  36: 'size-9 text-[13px]',
  48: 'size-12 text-[15px]',
};

export function Avatar({ initials, size = 32 }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn('grid shrink-0 place-items-center rounded-full bg-[#3A3F4A] font-semibold text-[#EDEEF1]', SIZE[size])}
    >
      {initials}
    </span>
  );
}
