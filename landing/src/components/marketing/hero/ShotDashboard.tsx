'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Download, Search, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { PricesSummaryBadge } from '@/components/app/result/PriceStatusBadge';
import { CATEGORY_COLOR } from '@/components/app/result/categories';
import { NAV_ITEMS } from '@/components/app/shell/navigation';
import { useEngineText } from '@/components/app/common/useEngineText';
import { Logo } from '@/components/brand/Logo';
import { useBuildProgress } from '@/hooks/useBuildProgress';
import { dec, fmt, mln, rangeMln } from '@/lib/format';
import { EASE_OUT } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { useDemoShot } from './useDemoShot';

const PANEL = 'sheen rounded-xl border border-line bg-surface shadow-(--shadow-card)';
const NAV_ITEM = 'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px]';
const ACTION = 'flex h-[34px] items-center gap-1.5 rounded-[9px] px-3 text-[13px]';
const TABLE_ROW =
  'grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)] gap-3 border-b border-line px-4 tabular-nums';
const COLUMN_KEYS = ['name', 'qty', 'price', 'total'] as const;
const BUILD_DELAY_MS = 1100;
const BUILD_DURATION_MS = 2200;
const ROW_STEP_S = 0.14;

export function ShotDashboard() {
  const t = useTranslations('shot');
  const tApp = useTranslations('app');
  const { lineName, lineQty } = useEngineText();
  const { input, result, topMaterials, breakdown } = useDemoShot();
  const roomName = tApp(`rooms.${input.room}.name`);
  const ref = useRef<HTMLDivElement>(null);
  const { started, progress: p } = useBuildProgress(ref, BUILD_DELAY_MS, BUILD_DURATION_MS);
  const reducedMotion = useReducedMotion();
  const scaled = (value: number) => value * p;
  const rowMotion = (index: number) => ({
    initial: reducedMotion ? false : { opacity: 0, x: -10 },
    animate: started ? { opacity: 1, x: 0 } : undefined,
    transition: { duration: 0.6, delay: index * ROW_STEP_S, ease: EASE_OUT },
  });

  const kpis = [
    { label: tApp('result.kpi.total'), value: rangeMln(scaled(result.low), scaled(result.high)), note: tApp('result.kpi.totalNote', { reserve: result.reserve }) },
    { label: tApp('result.kpi.materials'), value: mln(scaled(result.matTotal)), note: tApp('result.kpi.materialsNote', { count: result.mats.length }) },
    { label: tApp('result.kpi.labour'), value: mln(scaled(result.labTotal)), note: tApp('result.kpi.labourNote', { count: result.lab.length }) },
    { label: tApp('result.kpi.duration'), value: `${Math.round(scaled(result.dMin))}–${Math.round(scaled(result.dMax))}`, note: tApp('result.kpi.durationNote') },
  ];
  const donut = [
    ...breakdown.map(({ id, from, to }) => `${CATEGORY_COLOR[id]} ${from * p}% ${to * p}%`),
    `var(--surface-3) ${100 * p}% 100%`,
  ].join(',');

  return (
    <div ref={ref} className="overflow-hidden rounded-[15px] border border-line bg-bg-2">
      <div className="flex h-10 items-center gap-2 border-b border-line bg-surface px-4">
        <span className="size-2.5 rounded-full bg-surface-3" />
        <span className="size-2.5 rounded-full bg-surface-3" />
        <span className="size-2.5 rounded-full bg-surface-3" />
        <span className="mx-auto rounded-md bg-surface-2 px-3 py-1 font-mono text-xs/4 text-fg-3">{t('url')}</span>
      </div>

      <div className="flex min-h-[560px] text-left">
        <aside className="hidden w-54 shrink-0 flex-col gap-0.5 border-r border-line bg-bg-2 px-3 py-4 text-[13px]/5 lg:flex">
          <div className="px-2 pt-1 pb-5">
            <Logo size={22} />
          </div>
          <div className="px-2.5 pb-2 text-[10px]/4 font-medium tracking-[0.06em] text-fg-3 uppercase">{tApp('nav.workspace')}</div>
          {NAV_ITEMS.map(({ key, icon: Icon }) => (
            <div
              key={key}
              className={cn(
                NAV_ITEM,
                key === 'estimates' ? 'bg-surface-3 font-medium text-fg shadow-[inset_0_0_0_1px_var(--border)]' : 'text-fg-2',
              )}
            >
              <Icon size={15} strokeWidth={1.5} />
              <span className="flex-1">{tApp(`nav.${key}`)}</span>
            </div>
          ))}
          <div className="mt-auto rounded-xl border border-line bg-surface p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">{tApp('plan.freeTitle')}</span>
              <span className="text-fg-3 tabular-nums">{tApp('plan.freeUsage', { used: 1, limit: 3 })}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-1/3 rounded-full bg-accent" />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs/4 text-fg-3">
                {tApp('result.breadcrumb')} / {roomName}
              </div>
              <div className="mt-1 font-display text-[22px]/7 font-semibold tracking-[-0.02em]">
                {tApp('result.title', { name: roomName, length: dec(input.L), width: dec(input.W) })}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs/[22px]">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: p >= 1 ? 1 : 0 }} transition={{ duration: 0.5 }}>
                  <PricesSummaryBadge lines={result.mats} />
                </motion.span>
                <span className="text-fg-2">
                  {tApp('result.qualityBadge', { quality: tApp(`qualities.${input.quality}.name`) })} · {tApp('result.region')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={cn(ACTION, 'border border-line-2 bg-surface font-medium')}>
                <Share2 size={14} strokeWidth={1.5} />
                {tApp('result.share')}
              </span>
              <span className={cn(ACTION, 'gloss bg-accent font-semibold text-accent-ink')}>
                <Download size={14} strokeWidth={1.75} />
                {tApp('result.pdf')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {kpis.map((kpi, index) => (
              <div key={kpi.label} className={cn(PANEL, 'p-4')}>
                <div className="text-xs/4 text-fg-2">{kpi.label}</div>
                <div
                  className={cn(
                    'mt-2 font-display text-[21px]/7 font-semibold tracking-[-0.02em] whitespace-nowrap tabular-nums',
                    index === 0 && 'text-accent-text',
                  )}
                >
                  {kpi.value}
                </div>
                <div className="mt-1 truncate text-xs/4 text-fg-3">{kpi.note}</div>
              </div>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] gap-3">
            <div className={cn(PANEL, 'overflow-hidden')}>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-[13px] font-semibold">{tApp('result.materials')}</span>
                <span className="flex h-7 w-45 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-xs text-fg-3">
                  <Search size={12} strokeWidth={1.5} />
                  {tApp('result.searchMaterials')}
                </span>
              </div>
              <div className={cn(TABLE_ROW, 'py-2 text-[11px]/4 tracking-[0.04em] text-fg-3 uppercase')}>
                {COLUMN_KEYS.map((key, index) => (
                  <span key={key} className={cn(index > 0 && 'text-right')}>
                    {tApp(`result.columns.${key}`)}
                  </span>
                ))}
              </div>
              {topMaterials.map((line, index) => (
                <motion.div
                  key={`${line.cat}-${line.code}`}
                  className={cn(TABLE_ROW, 'py-2.5 text-[13px]/5 last:border-b-0')}
                  {...rowMotion(index)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-1.5 shrink-0 rounded-[2px]" style={{ background: CATEGORY_COLOR[line.cat] }} />
                    <span className="truncate">{lineName(line)}</span>
                  </span>
                  <span className="text-right text-fg-2">{lineQty(line)}</span>
                  <span className="text-right text-fg-2">{fmt(line.price)}</span>
                  <span className="text-right font-medium">{fmt(line.total)}</span>
                </motion.div>
              ))}
            </div>

            <div className={cn(PANEL, 'flex flex-col gap-4 p-4')}>
              <span className="text-[13px] font-semibold">{tApp('result.breakdown')}</span>
              <div className="relative mx-auto size-33 rounded-full" style={{ background: `conic-gradient(${donut})` }}>
                <div className="absolute inset-4.5 grid place-items-center rounded-full bg-surface text-center">
                  <div>
                    <div className="font-display text-lg/[22px] font-semibold tabular-nums">{mln(scaled(result.total))}</div>
                    <div className="text-[11px]/[14px] text-fg-3">{t('donutCaption')}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-xs/4 tabular-nums">
                {breakdown.map(({ id, share }, index) => (
                  <motion.div key={id} className="flex items-center gap-2" {...rowMotion(index + 2)}>
                    <span className="size-2 rounded-[2px]" style={{ background: CATEGORY_COLOR[id] }} />
                    <span className="text-fg-2">{tApp(`categories.${id}`)}</span>
                    <span className="ml-auto">{Math.round(share * p)}%</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
