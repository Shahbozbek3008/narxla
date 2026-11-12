import { useId } from 'react';
import { WET_ROOMS, type EstimateInput } from '@/lib/calc-engine';
import { dec } from '@/lib/format';

const VIEW = { width: 300, height: 160 };
const AREA = { left: 44, top: 44, width: 186, height: 82 };
const WALL = 3.5;
const DIMENSION_GAP = 12;
const DOOR_WIDTH = 0.9;
const WINDOW_WIDTH = 1.4;
const MAX_WINDOWS = 2;

type FloorPlanThumbProps = {
  input: Pick<EstimateInput, 'room' | 'L' | 'W' | 'doors' | 'windows' | 'works'>;
  className?: string;
};

export function FloorPlanThumb({ input, className }: FloorPlanThumbProps) {
  const id = useId();
  const length = Math.max(input.L, input.W);
  const width = Math.min(input.L, input.W);
  const scale = Math.min(AREA.width / length, AREA.height / width);
  const planWidth = length * scale;
  const planHeight = width * scale;
  const x = AREA.left + (AREA.width - planWidth) / 2;
  const y = AREA.top + (AREA.height - planHeight) / 2;
  const bottom = y + planHeight;
  const right = x + planWidth;

  const tiled = WET_ROOMS.includes(input.room);
  const pattern = `${id}-floor`;
  const floorFill = input.works.pol ? `url(#${pattern})` : 'var(--surface)';

  const doorWidth = Math.min(DOOR_WIDTH * scale, planWidth * 0.3);
  const doorX = x + Math.min(planWidth * 0.14, planWidth - doorWidth - 6);

  const windowCount = Math.min(input.windows, MAX_WINDOWS);
  const windowWidth = Math.min(WINDOW_WIDTH * scale, (planWidth / Math.max(windowCount, 1)) * 0.6);
  const windows = Array.from({ length: windowCount }, (_, index) => x + (planWidth * (index + 1)) / (windowCount + 1) - windowWidth / 2);

  const dimensionY = bottom + DIMENSION_GAP;
  const dimensionX = right + DIMENSION_GAP;

  return (
    <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} className={className} role="img" aria-hidden>
      <defs>
        {tiled ? (
          <pattern id={pattern} width="9" height="9" patternUnits="userSpaceOnUse">
            <rect width="9" height="9" fill="var(--surface)" />
            <path d="M9 0V9M0 9H9" stroke="var(--border-2)" strokeWidth="0.8" />
          </pattern>
        ) : (
          <pattern id={pattern} width="36" height="12" patternUnits="userSpaceOnUse">
            <rect width="36" height="12" fill="var(--surface)" />
            <path d="M0 6H36M0 12H36M24 0V6M10 6V12" stroke="var(--border-2)" strokeWidth="0.8" />
          </pattern>
        )}
      </defs>

      <rect x={x} y={y} width={planWidth} height={planHeight} fill={floorFill} />
      <rect x={x} y={y} width={planWidth} height={planHeight} fill="none" stroke="var(--text-2)" strokeWidth={WALL} />

      {windows.map((left) => (
        <g key={left}>
          <line x1={left} y1={y} x2={left + windowWidth} y2={y} stroke="var(--surface-2)" strokeWidth={WALL + 1} />
          <line x1={left} y1={y - 1.2} x2={left + windowWidth} y2={y - 1.2} stroke="var(--accent)" strokeWidth="1" />
          <line x1={left} y1={y + 1.2} x2={left + windowWidth} y2={y + 1.2} stroke="var(--accent)" strokeWidth="1" />
        </g>
      ))}

      {input.doors > 0 && (
        <g>
          <line x1={doorX} y1={bottom} x2={doorX + doorWidth} y2={bottom} stroke="var(--surface-2)" strokeWidth={WALL + 1} />
          <path
            d={`M${doorX} ${bottom}V${bottom - doorWidth}A${doorWidth} ${doorWidth} 0 0 1 ${doorX + doorWidth} ${bottom}`}
            fill="none"
            stroke="var(--text-3)"
            strokeWidth="1"
            strokeDasharray="2.5 2"
          />
        </g>
      )}

      <g stroke="var(--text-3)" strokeWidth="0.8">
        <line x1={x} y1={dimensionY} x2={right} y2={dimensionY} />
        <line x1={x} y1={dimensionY - 3} x2={x} y2={dimensionY + 3} />
        <line x1={right} y1={dimensionY - 3} x2={right} y2={dimensionY + 3} />
        <line x1={dimensionX} y1={y} x2={dimensionX} y2={bottom} />
        <line x1={dimensionX - 3} y1={y} x2={dimensionX + 3} y2={y} />
        <line x1={dimensionX - 3} y1={bottom} x2={dimensionX + 3} y2={bottom} />
      </g>
      <g fill="var(--text-2)" fontSize="10" fontFamily="var(--font-mono, monospace)">
        <text x={x + planWidth / 2} y={dimensionY + 13} textAnchor="middle">
          {dec(length)} m
        </text>
        <text x={dimensionX + 6} y={y + planHeight / 2 + 3.5}>
          {dec(width)} m
        </text>
      </g>
    </svg>
  );
}
