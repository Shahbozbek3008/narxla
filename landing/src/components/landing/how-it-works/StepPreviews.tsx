import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

type Pair = [label: string, value: string];

const CHIP = 'rounded-[10px] border p-3';
const ACTION = 'flex h-9 items-center justify-center rounded-[10px] px-2 text-center text-[13px]';

export function RoomPreview() {
  const t = useTranslations('how');
  const [selected, ...rooms] = t.raw('rooms') as string[];
  const flat = rooms.pop();

  return (
    <div className="grid grid-cols-2 gap-2">
      <div className={clsx(CHIP, 'flex items-center justify-between border-accent bg-accent-soft font-medium text-accent-text')}>
        {selected}
        <Check size={14} strokeWidth={2} />
      </div>
      {rooms.map((room) => (
        <div key={room} className={clsx(CHIP, 'border-line text-fg-2')}>
          {room}
        </div>
      ))}
      <div className={clsx(CHIP, 'border-dashed border-line-2 text-fg-2')}>{flat}</div>
    </div>
  );
}

export function DimensionsPreview() {
  const t = useTranslations('how');
  const fields = t.raw('fields') as Pair[];
  const areas = t.raw('areas') as Pair[];

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {fields.map(([label, value], index) => (
          <div key={label}>
            <div className="mb-1 text-[11px] text-fg-3">{label}</div>
            <div
              className={clsx(
                'flex h-9 items-center justify-between rounded-[10px] border bg-surface-2 px-2.5',
                index === 0 ? 'border-ring shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-line-2',
              )}
            >
              <span className="font-medium">{value}</span>
              <span className="text-fg-3">{t('unit')}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1 flex flex-col gap-2 border-t border-line pt-2">
        {areas.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span className="text-fg-2">{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EstimatePreview() {
  const t = useTranslations('how');

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs/4 text-fg-2">{t('totalLabel')}</div>
      <div className="font-display text-[26px]/8 font-semibold tracking-[-0.025em] text-accent-text">{t('totalValue')}</div>
      <div className="grid grid-cols-2 gap-2">
        <span className={clsx(ACTION, 'gloss bg-accent font-semibold text-accent-ink')}>{t('pdf')}</span>
        <span className={clsx(ACTION, 'border border-line-2 font-medium')}>{t('send')}</span>
      </div>
    </div>
  );
}
