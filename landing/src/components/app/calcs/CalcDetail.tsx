'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { Link } from '@/i18n/navigation';
import { findCalculator, runCalculator, type CalcValues } from '@/lib/calc-engine';
import { fmt, num } from '@/lib/format';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useCalc } from '@/store/calc';
import { useDraft } from '@/store/draft';
import { usePriceBook } from '@/store/prices';
import { EmptyCard } from '../common/EmptyCard';
import { BackLink } from '../common/PageHeader';
import { NumberField } from '../common/NumberField';
import { card, fieldLabel, plainCard } from '../common/styles';
import { useEngineText } from '../common/useEngineText';
import { useNotify } from '../common/useNotify';
import { PathIcon } from './PathIcon';
import { SOURCE_TONE } from './SourceBadge';

const ROUND_TO = 1000;

export function CalcDetail({ id }: { id: string }) {
  const t = useTranslations('app');
  const calculator = findCalculator(id);
  const stored = useCalc((state) => state.values[id]);
  const book = usePriceBook();
  const setValue = useCalc((state) => state.setValue);
  const room = useDraft((state) => state.room);
  const notify = useNotify();
  const { unit, quantity, calcName, calcDesc } = useEngineText();

  if (!calculator) {
    return (
      <EmptyCard
        className="mt-6"
        title={t('calcs.notFoundTitle')}
        text={t('calcs.notFoundText')}
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href={routes.calcs}>{t('calcs.back')}</Link>
          </Button>
        }
      />
    );
  }

  const raw = (key: string, fallback: string) => stored?.[key] ?? fallback;
  const values: CalcValues = Object.fromEntries(
    calculator.inputs.map((input) => [input.k, input.type === 'num' ? num(raw(input.k, input.def)) : raw(input.k, input.def)]),
  );
  const output = runCalculator(calculator, values, book);
  const cost = Math.round(output.cost / ROUND_TO) * ROUND_TO;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <BackLink href={routes.calcs} label={t('calcs.back')} />
        <div className="mt-2 flex items-center gap-3.5">
          <span className="sheen grid size-12 shrink-0 place-items-center rounded-[14px] border border-line-2 bg-surface text-accent-text shadow-(--shadow-card)">
            <PathIcon path={calculator.icon} size={24} />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(24px,3vw,30px)] leading-[1.2] font-semibold tracking-[-0.03em]">
              {calcName(calculator)}
            </h1>
            <p className="text-[13px] text-fg-3">
              {t('calcs.caption', { category: t(`calcs.categories.${calculator.cat}`), desc: calcDesc(calculator) })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-4">
        <div className={cn(card, 'flex flex-col gap-[18px] p-5')}>
          {calculator.inputs.map((input) =>
            input.type === 'num' ? (
              <NumberField
                key={input.k}
                size="lg"
                label={t(`calcs.fields.${input.label}`)}
                unit={unit(input.unit)}
                value={raw(input.k, input.def)}
                onChange={(event) => setValue(calculator.id, input.k, event.target.value)}
              />
            ) : (
              <div key={input.k} className="flex flex-col gap-1.5">
                <span className={fieldLabel}>{t(`calcs.fields.${input.label}`)}</span>
                <Segmented
                  size="md"
                  wrap
                  label={t(`calcs.fields.${input.label}`)}
                  value={raw(input.k, input.def)}
                  onChange={(value) => setValue(calculator.id, input.k, value)}
                  options={input.opts.map(([value, label]) => ({ value, label: t(`calcs.options.${label}`) }))}
                  className="max-w-full self-start"
                />
              </div>
            ),
          )}
          <p className="border-t border-line pt-3.5 text-[13px]/5 text-fg-3">{t(`calcs.items.${calculator.id}.note`)}</p>
        </div>

        <div className={cn(plainCard, 'overflow-hidden')} aria-live="polite">
          <dl>
            {output.rows.map(({ key, value, unit: rowUnit, precise }) => (
              <div key={key} className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 tabular-nums">
                <dt className="text-sm/5 text-fg-2">{t(`calcs.rows.${key}`)}</dt>
                <dd className="font-display text-lg font-semibold whitespace-nowrap">{quantity(value, rowUnit, precise)}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-3 bg-surface-2 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex flex-col">
                <span className="text-xs text-fg-3">{t('calcs.cost')}</span>
                <span className="font-display text-[22px] font-semibold text-accent-text tabular-nums">
                  {t('money', { value: fmt(cost) })}
                </span>
              </span>
              <Button
                variant="secondary"
                size="md"
                className="hover:bg-surface-3"
                onClick={() =>
                  notify('addedToEstimate', 'success', { calc: calcName(calculator), room: t(`rooms.${room}.name`) })
                }
              >
                {t('calcs.addToEstimate')}
              </Button>
            </div>
            <Badge tone={SOURCE_TONE[output.status]} shape="status" dot className="self-start">
              {t(`calcs.source.${output.status}.long`)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
