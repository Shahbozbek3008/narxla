'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { checkPrice, estimateLabourRange, type Estimate } from '@/lib/calc-engine';
import { digitsOnly, fmt, mln } from '@/lib/format';
import { labourInfo } from '@/lib/prices/price-book';
import { cn } from '@/lib/utils';
import { usePriceBook } from '@/store/prices';
import { NumberField } from '../common/NumberField';
import { card, sectionLabel } from '../common/styles';
import { useEngineText } from '../common/useEngineText';
import { CheckEmpty, CheckVerdict } from './CheckResult';

const MAX_PRICE_DIGITS = 11;

type EstimateCheckProps = {
  name: string;
  result: Estimate;
};

export function EstimateCheck({ name, result }: EstimateCheckProps) {
  const t = useTranslations('app.check');
  const tApp = useTranslations('app');
  const book = usePriceBook();
  const { lineName, lineQty } = useEngineText();
  const [quote, setQuote] = useState('');

  const { works, range } = estimateLabourRange(result.lab, (code) => labourInfo(book, code));
  const byKey = new Map(result.lab.map((line) => [`${line.cat}-${line.code}`, line]));
  const amount = Number(quote) || 0;

  return (
    <>
      <div className={cn(card, 'flex flex-col gap-5 p-5')}>
        <div>
          <p className="font-semibold">{t('estimateTitle')}</p>
          <p className="mt-0.5 text-[13px]/5 text-fg-3">{t('estimateLead', { name, count: works.length })}</p>
        </div>

        <div className="overflow-hidden rounded-xl border border-line">
          <div className={cn(sectionLabel, 'flex justify-between gap-3 border-b border-line bg-surface-2 px-3.5 py-2')}>
            <span>{t('work')}</span>
            <span>{t('marketRange')}</span>
          </div>
          <ul className="text-sm/5 tabular-nums">
            {result.lab.map((line, index) => {
              const { lo, hi } = works[index];
              const key = `${line.cat}-${line.code}`;
              const source = byKey.get(key) ?? line;
              return (
                <li key={key} className="flex items-center justify-between gap-3 border-b border-line px-3.5 py-2.5 last:border-b-0">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{lineName(source)}</span>
                    <span className="text-xs/4 text-fg-3">{lineQty(source)}</span>
                  </span>
                  <span className="shrink-0 text-right text-fg-2">
                    {mln(lo)}–{tApp('mln', { value: mln(hi) })}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-3.5 py-2.5 text-sm/5 font-semibold tabular-nums">
            <span>{t('labourTotal')}</span>
            <span>{tApp('money', { value: fmt(Math.round(result.labTotal)) })}</span>
          </div>
        </div>

        <NumberField
          size="xl"
          inputMode="numeric"
          label={t('quoteTotal')}
          unit={tApp('currency')}
          placeholder={t('quotePlaceholder')}
          hint={t('quoteHint')}
          value={quote ? fmt(Number(quote)) : ''}
          onChange={(event) => setQuote(digitsOnly(event.target.value, MAX_PRICE_DIGITS))}
        />
      </div>

      {amount > 0 ? <CheckVerdict result={checkPrice(range, 1, amount)} /> : <CheckEmpty />}
    </>
  );
}
