'use client';

import { useTranslations } from 'next-intl';
import { estimate, QUALITIES } from '@/lib/calc-engine';
import { dec, fmt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { draftToInput, useDraft } from '@/store/draft';
import { usePriceBook } from '@/store/prices';
import { StepHeading } from './StepHeading';

const MILLION = 1e6;
const EXAMPLE_KEYS = ['floor', 'paint', 'tile'] as const;

const perSquareMeter = (value: number) =>
  value >= MILLION ? `${dec(value / MILLION)} mln` : fmt(Math.round(value / 1000) * 1000);

export function QualityStep() {
  const t = useTranslations('app');
  const draft = useDraft();
  const input = draftToInput(draft);
  const book = usePriceBook();

  return (
    <div>
      <StepHeading title={t('wizard.quality.title')} lead={t('wizard.quality.lead')} />
      <div role="radiogroup" className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3">
        {QUALITIES.map((quality) => {
          const result = estimate({ ...input, quality }, book);
          const area = Math.max(result.area, 0.1);
          const selected = draft.quality === quality;

          return (
            <button
              key={quality}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => draft.setQuality(quality)}
              className={cn(
                'sheen flex flex-col gap-4 rounded-2xl border bg-surface p-5 text-left transition-[border-color,box-shadow,translate] duration-200 hover:-translate-y-0.5 hover:border-fg-3',
                selected
                  ? 'border-accent shadow-[0_0_0_4px_var(--accent-soft),var(--shadow-lift)]'
                  : 'border-line shadow-(--shadow-card)',
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-lg font-semibold">{t(`qualities.${quality}.name`)}</span>
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full border-[1.5px] transition-colors duration-200',
                    selected ? 'border-accent' : 'border-line-2',
                  )}
                >
                  <span
                    className={cn(
                      'size-2.5 rounded-full bg-accent transition-transform duration-250 ease-(--ease-out-expo)',
                      selected ? 'scale-100' : 'scale-0',
                    )}
                  />
                </span>
              </span>
              <span className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    'font-display text-[22px]/7 font-semibold tracking-[-0.02em] tabular-nums',
                    selected && 'text-accent-text',
                  )}
                >
                  {perSquareMeter(result.low / area)}–{perSquareMeter(result.high / area)}
                </span>
                <span className="text-[13px] text-fg-3">{t('wizard.quality.unit')}</span>
              </span>
              <span className="text-sm/5 text-fg-2">{t(`qualities.${quality}.desc`)}</span>
              <span className="flex flex-col gap-1.5 border-t border-line pt-3.5 text-[13px]/[18px] text-fg-2">
                {EXAMPLE_KEYS.map((key) => (
                  <span key={key} className="flex items-center gap-2">
                    <span className="size-1 rounded-full bg-fg-3" />
                    {t(`qualities.${quality}.examples.${key}`)}
                  </span>
                ))}
              </span>
              <span className="min-h-4 text-xs/4 font-semibold text-accent-text">{t(`qualities.${quality}.badge`)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
