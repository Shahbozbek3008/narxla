'use client';

import { House } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { ROOMS } from '@/lib/calc-engine';
import { useDraft } from '@/store/draft';
import { SelectCard } from '../common/SelectCard';
import { useNotify } from '../common/useNotify';
import { ROOM_ICONS } from './options';
import { StepHeading } from './StepHeading';

export function RoomStep() {
  const t = useTranslations('app');
  const room = useDraft((state) => state.room);
  const pickRoom = useDraft((state) => state.pickRoom);
  const notify = useNotify();

  return (
    <div>
      <StepHeading title={t('wizard.room.title')} lead={t('wizard.room.lead')} />
      <div role="radiogroup" className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-3">
        {ROOMS.map(({ id }) => {
          const Icon = ROOM_ICONS[id];
          return (
            <SelectCard
              key={id}
              indicator="radio"
              selected={room === id}
              icon={<Icon size={20} strokeWidth={1.5} />}
              title={t(`rooms.${id}.name`)}
              description={t(`rooms.${id}.hint`)}
              onSelect={() => pickRoom(id)}
            />
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => notify('flat', 'info')}
        className="mt-3 flex w-full items-center gap-4 rounded-2xl border border-dashed border-line-2 p-[18px] text-left transition-[border-color,background-color] duration-200 hover:border-fg-3 hover:bg-surface"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-[11px] border border-line-2 text-fg-2">
          <House size={20} strokeWidth={1.5} aria-hidden />
        </span>
        <span className="flex flex-1 flex-col">
          <span className="text-[15px] font-semibold">{t('wizard.room.flat')}</span>
          <span className="text-[13px] text-fg-3">{t('wizard.room.flatHint')}</span>
        </span>
        <Badge tone="accent" shape="tag">
          {t('wizard.room.flatBadge')}
        </Badge>
      </button>
    </div>
  );
}
