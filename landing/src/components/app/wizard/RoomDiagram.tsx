'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Segmented } from '@/components/ui/segmented';
import { useWebGLSupport } from '@/hooks/useWebGLSupport';
import { dec } from '@/lib/format';
import { cn } from '@/lib/utils';
import { card } from '../common/styles';
import { RoomPlan2D } from './room/RoomPlan2D';
import type { RoomShape } from './room/types';

type ViewMode = '3d' | '2d';

const SceneFallback = () => <div className="grid-bg h-full bg-surface-2 bg-size-[20px_20px]" aria-hidden />;

const RoomScene3D = dynamic(() => import('./room/RoomScene3D'), { ssr: false, loading: SceneFallback });

const MIN_SIDE = 0.5;
const MAX_SIDE = 20;
const MIN_HEIGHT = 2;
const MAX_HEIGHT = 4;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value || min));

type RoomDiagramProps = RoomShape & {
  walls: number;
  perimeter: number;
};

export function RoomDiagram({ walls, perimeter, ...shape }: RoomDiagramProps) {
  const t = useTranslations('app.wizard.dims');
  const webgl = useWebGLSupport();
  const [mode, setMode] = useState<ViewMode>('3d');
  const view = webgl ? mode : '2d';

  const sceneShape: RoomShape = {
    ...shape,
    length: clamp(shape.length, MIN_SIDE, MAX_SIDE),
    width: clamp(shape.width, MIN_SIDE, MAX_SIDE),
    height: clamp(shape.height, MIN_HEIGHT, MAX_HEIGHT),
  };

  const stats = [
    { label: t('stats.floor'), value: `${dec(shape.area)} m²` },
    { label: t('stats.walls'), value: `${dec(walls)} m²` },
    { label: t('stats.ceiling'), value: `${dec(shape.area)} m²` },
    { label: t('stats.perimeter'), value: `${dec(perimeter)} m` },
  ];

  return (
    <div className={cn(card, 'overflow-hidden')}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-[18px] py-3.5">
        <span className="text-sm font-semibold">{t('diagram')}</span>
        <span className="flex items-center gap-2">
          {webgl && (
            <Segmented<ViewMode>
              size="mini"
              label={t('viewLabel')}
              value={mode}
              onChange={setMode}
              options={[
                { value: '3d', label: t('view3d') },
                { value: '2d', label: t('view2d') },
              ]}
            />
          )}
          <span className="rounded-md bg-surface-3 px-2 font-mono text-xs/[22px] text-fg-2">h = {shape.heightLabel} m</span>
        </span>
      </div>

      <div className="relative h-80">
        {view === '3d' ? (
          <div className="h-full bg-[radial-gradient(ellipse_70%_65%_at_50%_45%,var(--surface),var(--surface-2))]">
            <RoomScene3D {...sceneShape} />
          </div>
        ) : (
          <RoomPlan2D {...shape} />
        )}
      </div>

      <dl className="grid grid-cols-2 border-t border-line tabular-nums">
        {stats.map(({ label, value }, index) => (
          <div
            key={label}
            className={cn('px-[18px] py-3.5', index % 2 === 0 && 'border-r border-line', index < 2 && 'border-b border-line')}
          >
            <dt className="text-xs text-fg-3">{label}</dt>
            <dd className="text-[17px] font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
