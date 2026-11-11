import clsx from 'clsx';

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

const RING = {
  surface: 'shadow-[0_0_0_3px_var(--surface)]',
  'surface-2': 'shadow-[0_0_0_3px_var(--surface-2)]',
};

export function RangeScale({ marker, label, size = 'md', ring = 'surface', className }: RangeScaleProps) {
  const track = TRACK[size];
  const position = { left: `${marker}%` };

  return (
    <div className={clsx('relative flex gap-[3px]', track.root, className)} aria-hidden>
      <span className={clsx('flex-1 bg-success-soft', track.low)} />
      <span className="flex-[1.4] bg-success opacity-50" />
      <span className={clsx('flex-1 bg-danger-soft', track.high)} />
      {label && (
        <span
          className="absolute -top-[22px] -translate-x-1/2 text-[11px]/[14px] font-semibold whitespace-nowrap text-accent-text"
          style={position}
        >
          {label}
        </span>
      )}
      <span
        className={clsx('absolute -top-[5px] w-1 -translate-x-1/2 rounded-[2px] bg-accent', track.marker, RING[ring])}
        style={position}
      />
    </div>
  );
}
