'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Segmented } from '@/components/ui/segmented';
import { CHECK, CHECK_CATS, type CheckCategory } from '@/lib/calc-engine';
import { fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useCheck } from '@/store/check';
import { NumberField } from '../common/NumberField';
import { card, fieldLabel } from '../common/styles';

export function CheckForm() {
  const t = useTranslations('app.check');
  const tApp = useTranslations('app');
  const { cat, type, volume, price, pickCategory, pickType, setVolume, setPrice } = useCheck();
  const current = CHECK.find((item) => item.id === type) ?? CHECK[0];

  return (
    <div className={cn(card, 'flex flex-col gap-5 p-5')}>
      <div className="flex flex-col gap-2">
        <span className={fieldLabel}>{t('type')}</span>
        <Segmented<CheckCategory>
          wrap
          stretch
          label={t('type')}
          value={cat}
          onChange={pickCategory}
          options={CHECK_CATS.map((value) => ({ value, label: t(`categories.${value}`) }))}
        />
        <div role="radiogroup" aria-label={t('type')} className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] gap-1.5">
          {CHECK.filter((item) => item.cat === cat).map((item) => {
            const selected = item.id === type;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => pickType(item.id)}
                className={cn(
                  'flex flex-col gap-0.5 rounded-[10px] border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 hover:border-fg-3',
                  selected ? 'border-accent bg-accent-soft shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-line bg-surface-2',
                )}
              >
                <span className={cn('text-[13px]/[18px] font-semibold', selected ? 'text-accent-text' : 'text-fg')}>
                  {item.name}
                </span>
                <span className="text-xs/4 text-fg-3 tabular-nums">{t('rate', { rate: fmt(item.avg), unit: item.u })}</span>
              </button>
            );
          })}
        </div>
      </div>

      <NumberField
        label={t('volume')}
        labelAside={
          <Badge tone={current.ok ? 'success' : 'neutral'} dot>
            {current.ok ? t('verified') : t('estimated')}
          </Badge>
        }
        unit={current.u}
        className="[&_input]:pr-11"
        value={volume}
        onChange={(event) => setVolume(event.target.value)}
      />

      <NumberField
        size="xl"
        inputMode="numeric"
        label={t('quote')}
        unit={tApp('currency')}
        placeholder={t('quotePlaceholder')}
        hint={t('quoteHint')}
        value={price ? fmt(Number(price)) : ''}
        onChange={(event) => setPrice(event.target.value)}
      />
    </div>
  );
}
