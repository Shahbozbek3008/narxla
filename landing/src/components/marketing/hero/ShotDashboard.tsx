import { Calculator, Download, Folder, Plus, Search, Settings, Share2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';

type Kpi = { label: string; value: string; note: string };
type MaterialRow = [name: string, qty: string, price: string, total: string];
type LegendItem = [name: string, share: string];

const SIDEBAR_ICONS = [Folder, Plus, Calculator, ShieldCheck];
const LEGEND_SWATCHES = [
  'bg-cat-pol',
  'bg-cat-devor',
  'bg-cat-shift',
  'bg-cat-elektr',
  'bg-surface-3 shadow-[inset_0_0_0_1px_var(--border-2)]',
];

const PANEL = 'sheen rounded-xl border border-line bg-surface shadow-(--shadow-card)';
const NAV_ITEM = 'flex items-center gap-2.5 rounded-lg px-2.5 py-[7px]';
const ACTION = 'flex h-[34px] items-center gap-1.5 rounded-[9px] px-3 text-[13px]';
const TABLE_ROW =
  'grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1.1fr)] gap-3 border-b border-line px-4 tabular-nums';

export function ShotDashboard() {
  const t = useTranslations('shot');
  const navItems = t.raw('nav') as string[];
  const kpis = t.raw('kpis') as Kpi[];
  const columns = t.raw('columns') as MaterialRow;
  const rows = t.raw('rows') as MaterialRow[];
  const legend = t.raw('legend') as LegendItem[];

  return (
    <div className="overflow-hidden rounded-[15px] border border-line bg-bg-2">
      <div className="flex h-10 items-center gap-2 border-b border-line bg-surface px-4">
        <span className="size-2.5 rounded-full bg-surface-3" />
        <span className="size-2.5 rounded-full bg-surface-3" />
        <span className="size-2.5 rounded-full bg-surface-3" />
        <span className="mx-auto rounded-md bg-surface-2 px-3 py-1 font-mono text-xs/4 text-fg-3">{t('url')}</span>
      </div>

      <div className="flex min-h-[560px] text-left">
        <aside className="hidden w-54 shrink-0 flex-col gap-0.5 border-r border-line bg-surface px-3 py-4 text-[13px]/5 lg:flex">
          <div className="px-2 pt-1 pb-4">
            <Logo size={20} compact />
          </div>
          {navItems.map((label, index) => {
            const Icon = SIDEBAR_ICONS[index];
            return (
              <div
                key={label}
                className={cn(NAV_ITEM, index === 0 ? 'bg-surface-3 font-medium text-fg' : 'text-fg-2')}
              >
                <Icon size={15} strokeWidth={1.5} />
                {label}
              </div>
            );
          })}
          <div className={cn(NAV_ITEM, 'mt-auto text-fg-2')}>
            <Settings size={15} strokeWidth={1.5} />
            {t('settings')}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs/4 text-fg-3">{t('breadcrumb')}</div>
              <div className="mt-1 font-display text-[22px]/7 font-semibold tracking-[-0.02em]">{t('title')}</div>
              <div className="mt-2 flex items-center gap-2 text-xs/4 text-fg-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-0.5 font-medium text-success">
                  <span className="size-1.5 rounded-full bg-success" />
                  {t('pricesBadge')}
                </span>
                <span>{t('meta')}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={cn(ACTION, 'border border-line-2 bg-surface font-medium')}>
                <Share2 size={14} strokeWidth={1.5} />
                {t('share')}
              </span>
              <span className={cn(ACTION, 'gloss bg-accent font-semibold text-accent-ink')}>
                <Download size={14} strokeWidth={1.75} />
                {t('pdf')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {kpis.map((kpi, index) => (
              <div key={kpi.label} className={cn(PANEL, 'p-4')}>
                <div className="text-xs/4 text-fg-2">{kpi.label}</div>
                <div
                  className={cn(
                    'mt-2 font-display text-[22px]/7 font-semibold tracking-[-0.02em] whitespace-nowrap tabular-nums',
                    index === 0 && 'text-accent-text',
                  )}
                >
                  {kpi.value}
                </div>
                <div className="mt-1 text-xs/4 text-fg-3">{kpi.note}</div>
              </div>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] gap-3">
            <div className={cn(PANEL, 'overflow-hidden')}>
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-[13px] font-semibold">{t('materials')}</span>
                <span className="flex h-7 w-45 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-xs text-fg-3">
                  <Search size={12} strokeWidth={1.5} />
                  {t('search')}
                </span>
              </div>
              <div className={cn(TABLE_ROW, 'py-2 text-[11px]/4 tracking-[0.04em] text-fg-3 uppercase')}>
                {columns.map((column, index) => (
                  <span key={column} className={cn(index > 0 && 'text-right')}>
                    {column}
                  </span>
                ))}
              </div>
              {rows.map(([name, qty, price, total]) => (
                <div key={name} className={cn(TABLE_ROW, 'py-2.5 text-[13px]/5 last:border-b-0')}>
                  <span className="truncate">{name}</span>
                  <span className="text-right text-fg-2">{qty}</span>
                  <span className="text-right text-fg-2">{price}</span>
                  <span className="text-right font-medium">{total}</span>
                </div>
              ))}
            </div>

            <div className={cn(PANEL, 'flex flex-col gap-4 p-4')}>
              <span className="text-[13px] font-semibold">{t('breakdown')}</span>
              <div className="relative mx-auto size-33 rounded-full bg-[conic-gradient(var(--cat-pol)_0_34%,var(--cat-devor)_34%_62%,var(--cat-shift)_62%_76%,var(--cat-elektr)_76%_88%,var(--surface-3)_88%_100%)]">
                <div className="absolute inset-4.5 grid place-items-center rounded-full bg-surface text-center">
                  <div>
                    <div className="font-display text-lg/[22px] font-semibold tabular-nums">{t('donutValue')}</div>
                    <div className="text-[11px]/[14px] text-fg-3">{t('donutCaption')}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-xs/4 tabular-nums">
                {legend.map(([name, share], index) => (
                  <div key={name} className="flex items-center gap-2">
                    <span className={cn('size-2 rounded-[2px]', LEGEND_SWATCHES[index])} />
                    <span className="text-fg-2">{name}</span>
                    <span className="ml-auto">{share}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
