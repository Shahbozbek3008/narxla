import clsx from 'clsx';
import { useTranslations } from 'next-intl';

type Pair = [label: string, value: string];

const STATUS_TIME = '9:41';
const STATUS_NETWORK = '5G';
const SEGMENTS = [
  'w-[34%] bg-cat-pol',
  'w-[28%] bg-cat-devor',
  'w-[14%] bg-cat-shift',
  'w-[12%] bg-cat-elektr',
  'w-[12%] bg-surface-3',
];

export function PhoneMockup() {
  const t = useTranslations('phone');
  const kpis = t.raw('kpis') as Pair[];
  const rows = t.raw('rows') as Pair[];

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
            <div className="text-xs text-fg-3">{t('caption')}</div>
            <div className="mt-1 text-xs text-fg-2">{t('label')}</div>
            <div className="font-display text-[30px]/9 font-semibold tracking-[-0.03em] text-accent-text">{t('value')}</div>
            <div className="text-xs text-fg-3">{t('note')}</div>
          </div>
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-[9px]">
            {SEGMENTS.map((segment) => (
              <span key={segment} className={clsx('h-full', segment)} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {kpis.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line bg-surface p-3">
                <div className="text-[11px]/4 text-fg-2">{label}</div>
                <div className="font-display text-[17px] font-semibold">{value}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-surface text-[13px]/5">
            {rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 border-b border-line px-3 py-2.5 last:border-b-0">
                <span>{label}</span>
                <span className="font-medium">{value}</span>
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
