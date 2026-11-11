'use client';

import { Lightbulb, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { checkPrice, type CheckTone } from '@/lib/calc-engine';
import { fmt, mln, num } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useCheck } from '@/store/check';
import { card } from '../common/styles';

const TONE: Record<CheckTone, string> = {
  success: 'text-success',
  accent: 'text-accent-text',
  danger: 'text-danger',
};

const SCALE_KEYS = ['low', 'range', 'high'] as const;

const MOVE = 'transition-[left] duration-600 ease-(--ease-out-expo)';

export function CheckResult() {
  const t = useTranslations('app.check');
  const tApp = useTranslations('app');
  const { type, volume, price } = useCheck();
  const amount = Number(price) || 0;
  const quantity = num(volume);

  if (amount <= 0 || quantity <= 0) {
    return (
      <div className={cn(card, 'flex min-h-70 flex-col items-center justify-center gap-2 p-5 text-center')}>
        <span className="grid size-11 place-items-center rounded-xl border border-line-2 text-fg-3">
          <ShieldCheck size={20} strokeWidth={1.5} aria-hidden />
        </span>
        <p className="mt-2 font-semibold">{t('emptyTitle')}</p>
        <p className="max-w-[280px] text-sm text-fg-2">{t('emptyText')}</p>
      </div>
    );
  }

  const result = checkPrice(type, quantity, amount);
  const stats = [
    { label: t('stats.min'), value: result.lo },
    { label: t('stats.avg'), value: result.avg },
    { label: t('stats.max'), value: result.hi },
  ];
  const tip =
    result.verdict === 'expensive'
      ? t('tips.expensive', { from: mln(result.avg), to: mln(result.avg * 1.05) })
      : t(`tips.${result.verdict}`);

  return (
    <div className={cn(card, 'flex flex-col gap-5 p-5')} aria-live="polite">
      <div>
        <p className="text-[13px] text-fg-3">{t('result')}</p>
        <p
          className={cn(
            'mt-1 font-display text-[clamp(26px,3vw,32px)] leading-[1.15] font-semibold tracking-[-0.03em]',
            TONE[result.tone],
          )}
        >
          {t(`verdicts.${result.verdict}`, { percent: result.percent })}
        </p>
        <p className="mt-1.5 text-sm text-fg-2 tabular-nums">{t('average', { value: fmt(result.avg) })}</p>
      </div>

      <div className="pt-7">
        <div className="relative flex h-2.5 gap-[3px]" aria-hidden>
          <span className="rounded-l-[5px] bg-success-soft" style={{ width: `${result.zone1}%` }} />
          <span className="bg-success opacity-45" style={{ width: `calc(${result.zone2}% - 3px)` }} />
          <span className="flex-1 rounded-r-[5px] bg-danger-soft" />
          <span className="absolute -top-1 h-[18px] w-[1.5px] bg-fg-3" style={{ left: `${result.avgPct}%` }} />
          <span
            className={cn(
              'absolute -top-[30px] -translate-x-1/2 rounded-md bg-accent px-2 py-0.5 text-xs/4 font-semibold whitespace-nowrap text-accent-ink',
              MOVE,
            )}
            style={{ left: `${result.markerPct}%` }}
          >
            {t('master')}
          </span>
          <span
            className={cn(
              'absolute -top-1.5 h-[22px] w-1 -translate-x-1/2 rounded-[2px] bg-accent shadow-[0_0_0_3px_var(--surface),0_0_16px_var(--glow)]',
              MOVE,
            )}
            style={{ left: `${result.markerPct}%` }}
          />
        </div>
        <div className="mt-2.5 flex justify-between text-xs text-fg-3">
          {SCALE_KEYS.map((key) => (
            <span key={key}>{t(`scale.${key}`)}</span>
          ))}
        </div>
      </div>

      <dl className="grid grid-cols-3 rounded-xl border border-line tabular-nums">
        {stats.map(({ label, value }, index) => (
          <div key={label} className={cn('px-3.5 py-3', index < 2 && 'border-r border-line')}>
            <dt className="text-xs text-fg-3">{label}</dt>
            <dd className="text-[15px] font-semibold">{tApp('mln', { value: mln(value) })}</dd>
          </div>
        ))}
      </dl>

      <div className="flex gap-3 rounded-xl border border-line bg-surface-2 p-3.5 text-sm/5 text-fg-2">
        <Lightbulb className="mt-0.5 shrink-0 text-accent-text" size={16} strokeWidth={1.5} aria-hidden />
        {tip}
      </div>
    </div>
  );
}
