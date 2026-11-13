'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Segmented } from '@/components/ui/segmented';
import { CHECK_CATS, CHECK_TYPES, findCheckType, type CheckCategory } from '@/lib/calc-engine';
import { fmt } from '@/lib/format';
import { labourInfo } from '@/lib/prices/price-book';
import { cn } from '@/lib/utils';
import { useCheck } from '@/store/check';
import { usePriceBook } from '@/store/prices';
import { NumberField } from '../common/NumberField';
import { card, fieldLabel } from '../common/styles';
import { useEngineText } from '../common/useEngineText';
import { useFormatDate } from '../common/useFormatDate';

export function CheckForm() {
  const t = useTranslations('app.check');
  const tApp = useTranslations('app');
  const { cat, type, volume, price, hints, pickCategory, pickType, setVolume, setPrice } = useCheck();
  const book = usePriceBook();
  const { unit } = useEngineText();
  const formatDate = useFormatDate();
  const current = findCheckType(type);
  const { updatedAt } = labourInfo(book, current.code);

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
          {CHECK_TYPES.filter((item) => item.cat === cat).map((item) => {
            const selected = item.code === type;
            return (
              <button
                key={item.code}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => pickType(item.code)}
                className={cn(
                  'flex flex-col gap-0.5 rounded-[10px] border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 hover:border-fg-3',
                  selected ? 'border-accent bg-accent-soft shadow-[0_0_0_3px_var(--accent-soft)]' : 'border-line bg-surface-2',
                )}
              >
                <span className={cn('text-[13px]/[18px] font-semibold', selected ? 'text-accent-text' : 'text-fg')}>
                  {tApp(`labour.${item.code}`)}
                </span>
                {hints[item.code] !== undefined && (
                  <span className="text-[11px]/4 font-medium text-success">{t('inEstimate')}</span>
                )}
                <span className="text-xs/4 text-fg-3 tabular-nums">{t('rate', { rate: fmt(labourInfo(book, item.code).price), unit: unit(item.unit) })}</span>
              </button>
            );
          })}
        </div>
      </div>

      <NumberField
        label={t('volume')}
        labelAside={
          <Badge tone={updatedAt ? 'success' : 'neutral'} dot>
            {updatedAt ? t('updated', { date: formatDate(updatedAt.slice(0, 10)) }) : t('estimated')}
          </Badge>
        }
        unit={unit(current.unit)}
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
