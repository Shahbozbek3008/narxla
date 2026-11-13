'use client';

import { useTranslations } from 'next-intl';
import { CATEGORY_COLOR } from '@/components/app/result/categories';
import { useEngineText } from '@/components/app/common/useEngineText';
import { dec, fmt, mln, rangeMln } from '@/lib/format';
import { useDemoShot } from './useDemoShot';

const STATUS_TIME = '9:41';
const STATUS_NETWORK = '5G';
const PHONE_ROWS = 3;

export function PhoneMockup() {
  const t = useTranslations('phone');
  const tApp = useTranslations('app');
  const { lineName, lineQty } = useEngineText();
  const { input, result, topMaterials, breakdown } = useDemoShot();

  const kpis = [
    { label: tApp('result.kpi.materials'), value: tApp('mln', { value: mln(result.matTotal) }) },
    { label: tApp('result.kpi.labour'), value: tApp('mln', { value: mln(result.labTotal) }) },
  ];

  return (
    <div
      role="img"
      aria-label={t('alt')}
      className="relative mx-auto max-w-[340px] rounded-[40px] bg-linear-to-b from-line-2 to-line p-2 shadow-(--shadow-elev) sm:hidden"
    >
      <div className="overflow-hidden rounded-[32px] border border-line bg-bg-2 text-left tabular-nums">
        <div className="flex h-9 items-center justify-between px-[22px] text-xs font-semibold">
          <span>{STATUS_TIME}</span>
          <span className="h-5 w-18 rounded-xl bg-black" />
          <span>{STATUS_NETWORK}</span>
        </div>
        <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
          <div>
            <div className="text-xs text-fg-3">
              {tApp(`rooms.${input.room}.name`)} · {dec(result.area)} m²
            </div>
            <div className="mt-1 text-xs text-fg-2">{tApp('result.kpi.total')}</div>
            <div className="font-display text-[28px]/9 font-semibold tracking-[-0.03em] whitespace-nowrap text-accent-text">
              {tApp('mlnSom', { value: rangeMln(result.low, result.high) })}
            </div>
            <div className="text-xs text-fg-3">{t('note', { reserve: result.reserve })}</div>
          </div>
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-[9px]">
            {breakdown.map(({ id, share }) => (
              <span key={id} className="h-full" style={{ width: `${share}%`, background: CATEGORY_COLOR[id] }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {kpis.map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-line bg-surface p-3">
                <div className="text-[11px]/4 text-fg-2">{label}</div>
                <div className="font-display text-[17px] font-semibold">{value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-surface text-[13px]/5">
            {topMaterials.slice(0, PHONE_ROWS).map((line) => (
              <div key={`${line.cat}-${line.code}`} className="flex justify-between gap-3 border-b border-line px-3 py-2.5 last:border-b-0">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{lineName(line)}</span>
                  <span className="text-[11px]/4 text-fg-3">{lineQty(line)}</span>
                </span>
                <span className="shrink-0 font-medium">{fmt(line.total)}</span>
              </div>
            ))}
          </div>
          <div className="gloss flex h-11 items-center justify-center rounded-[10px] bg-accent text-sm font-semibold text-accent-ink">
            {t('cta')}
          </div>
        </div>
      </div>
    </div>
  );
}
