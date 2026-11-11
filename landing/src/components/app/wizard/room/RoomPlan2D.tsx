import { useTranslations } from 'next-intl';
import { dec } from '@/lib/format';
import { cn } from '@/lib/utils';
import { doorOpenings, windowOpenings } from './openings';
import type { RoomShape } from './types';

const CANVAS = { width: 260, height: 180 };
const MIN_SIZE = { width: 40, height: 30 };
const MOVE = 'duration-450 ease-(--ease-out-expo)';

export function RoomPlan2D({ length, width, doors, windows, area, lengthLabel, widthLabel }: RoomShape) {
  const t = useTranslations('app.wizard.dims');
  const scale = Math.min(CANVAS.width / Math.max(length, 0.5), CANVAS.height / Math.max(width, 0.5));
  const w = Math.max(MIN_SIZE.width, length * scale);
  const h = Math.max(MIN_SIZE.height, width * scale);
  const px = w / Math.max(length, 0.01);

  return (
    <div className="grid-bg grid h-full place-items-center bg-surface-2 bg-size-[20px_20px]" aria-hidden>
      <div
        className={cn('relative rounded-[2px] border-2 border-fg bg-surface transition-[width,height]', MOVE)}
        style={{ width: w, height: h }}
      >
        <span className="absolute inset-x-0 -top-7 text-center font-mono text-xs text-fg-2">{lengthLabel} m</span>
        <span className="absolute inset-x-0 -top-3 h-px bg-line-2" />
        <span className="absolute inset-y-0 left-[calc(100%+12px)] flex items-center font-mono text-xs text-fg-2 [writing-mode:vertical-rl]">
          {widthLabel} m
        </span>
        {windowOpenings(length, windows).map(({ start, width: size }, index) => (
          <span
            key={`window-${index}`}
            className={cn('absolute -top-[5px] h-2 border-[1.5px] border-accent bg-surface transition-[left,width]', MOVE)}
            style={{ left: start * px, width: size * px }}
          />
        ))}
        {doorOpenings(length, doors).map(({ start, width: size }, index) => (
          <span key={`door-${index}`}>
            <span
              className={cn('absolute -bottom-[3px] h-[5px] bg-surface transition-[left,width]', MOVE)}
              style={{ left: start * px, width: size * px }}
            />
            <span
              className={cn(
                'absolute bottom-0 rounded-tr-full border-t-[1.5px] border-r-[1.5px] border-dashed border-fg-3 transition-[left,width,height]',
                MOVE,
              )}
              style={{ left: start * px, width: size * px, height: size * px }}
            />
          </span>
        ))}
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl/6 font-semibold tabular-nums">{dec(area)} m²</span>
          <span className="text-[11px] text-fg-3">{t('floorCaption')}</span>
        </span>
      </div>
    </div>
  );
}
