import { cn } from '@/lib/utils';

type Size = 'sm' | 'md';

type RangeScaleProps = {
  marker: number;
  label?: string;
  size?: Size;
  ring?: 'surface' | 'surface-2';
  className?: string;
};

const TRACK: Record<Size, { root: string; low: string; high: string; marker: string }> = {
  sm: { root: 'h-1.5', low: 'rounded-l-[3px]', high: 'rounded-r-[3px]', marker: 'h-4' },
  md: { root: 'h-2', low: 'rounded-l-[4px]', high: 'rounded-r-[4px]', marker: 'h-[18px]' },
};

const SLIDE = 'transition-[left] duration-[1400ms] ease-[cubic-bezier(.34,1.3,.5,1)]';

const RING = {
  surface: 'shadow-[0_0_0_3px_var(--surface)]',
  'surface-2': 'shadow-[0_0_0_3px_var(--surface-2)]',
};

export function RangeScale({ marker, label, size = 'md', ring = 'surface', className }: RangeScaleProps) {
  const track = TRACK[size];
  const position = { left: `${marker}%` };

  return (
    <div className={cn('relative flex gap-[3px]', track.root, className)} aria-hidden>
      <span className={cn('flex-1 bg-success-soft', track.low)} />
      <span className="flex-[1.4] bg-success opacity-50" />
      <span className={cn('flex-1 bg-danger-soft', track.high)} />
      {label && (
        <span
          className={cn('absolute -top-[22px] -translate-x-1/2 text-[11px]/[14px] font-semibold whitespace-nowrap text-accent-text', SLIDE)}
          style={position}
        >
          {label}
        </span>
      )}
      <span
        className={cn('absolute -top-[5px] w-1 -translate-x-1/2 rounded-[2px] bg-accent', SLIDE, track.marker, RING[ring])}
        style={position}
      />
    </div>
  );
}
