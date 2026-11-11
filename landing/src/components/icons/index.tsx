import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

const base = ({ size = 16, strokeWidth = 1.5, ...rest }: IconProps) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...rest,
});

export const Tile = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 3v18M3 12h18" />
    <path d="M7 7.5h1M16 16.5h1" strokeWidth={2} />
  </svg>
);

export const Laminate = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="4" width="18" height="16" rx="1.5" />
    <path d="M3 9.33h18M3 14.67h18M10 4v5.33M15 9.33v5.34M7 14.67V20M18 4v5.33" />
  </svg>
);

export const Trowel = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 14h13.5l4.5-7H8.5z" />
    <path d="M11 14v3" />
    <rect x="8.5" y="17" width="5" height="4" rx="1" />
  </svg>
);

export const Drywall = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M8 3h12v15H8z" />
    <path d="M5 6v15h12" />
    <path d="M11.5 6.5h.01M16.5 6.5h.01M11.5 14.5h.01M16.5 14.5h.01" strokeWidth={2.2} />
  </svg>
);

export const Burger = () => (
  <span className="flex w-5 flex-col items-start gap-[5px]" aria-hidden>
    <span className="h-[1.5px] w-5 rounded-[2px] bg-current" />
    <span className="h-[1.5px] w-[13px] rounded-[2px] bg-current" />
  </span>
);

export const Ceiling = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 4h18M7 4v5M17 4v5M12 4v9M9 13h6l-1 4h-4z" />
  </svg>
);
