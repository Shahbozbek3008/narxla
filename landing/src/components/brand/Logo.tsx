import { BRAND_NAME } from '@/lib/config';
import { cn } from '@/lib/utils';

const LOGO_PATH =
  'M16.5 6.5h-7A2.5 2.5 0 0 0 7 9v.5A2.5 2.5 0 0 0 9.5 12h5a2.5 2.5 0 0 1 2.5 2.5v.5a2.5 2.5 0 0 1-2.5 2.5h-7';

const TILE_RADIUS_RATIO = 0.28;
const GLYPH_RATIO = 0.7;

type LogoMarkProps = {
  size?: number;
};

export function LogoMark({ size = 28 }: LogoMarkProps) {
  const glyph = Math.round(size * GLYPH_RATIO);

  return (
    <span
      className="grid shrink-0 place-items-center bg-accent shadow-[inset_0_1px_0_rgba(255,255,255,.35),inset_0_-1px_0_rgba(0,0,0,.14)]"
      style={{ width: size, height: size, borderRadius: Math.round(size * TILE_RADIUS_RATIO) }}
    >
      <svg
        width={glyph}
        height={glyph}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d={LOGO_PATH} />
      </svg>
    </span>
  );
}

type LogoProps = {
  size?: number;
  compact?: boolean;
};

export function Logo({ size = 28, compact = false }: LogoProps) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <span
        className={cn('font-display font-semibold', compact ? 'text-sm' : 'text-[17px] tracking-[-0.02em]')}
      >
        {BRAND_NAME}
      </span>
    </span>
  );
}
