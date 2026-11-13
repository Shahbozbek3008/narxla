'use client';

import { ArrowRight, Calculator, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/router';
import type { Reply } from '@/lib/assistant/respond';
import { CHECK_TYPES, findCalculator, WORK_IDS, type CheckTone } from '@/lib/calc-engine';
import { dec, fmt, mln, rangeMln } from '@/lib/format';
import { DRAFT_ESTIMATE_ID, routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useCalculation } from '@/store/calculation';
import { LAST_STEP, useDraft } from '@/store/draft';
import { CATEGORY_COLOR } from '../result/categories';
import { useEngineText } from '../common/useEngineText';

type EstimateReply = Extract<Reply, { kind: 'estimate' }>;
type CalcReply = Extract<Reply, { kind: 'calc' }>;
type CheckReply = Extract<Reply, { kind: 'check' }>;

const TONE: Record<CheckTone, string> = { success: 'text-success', accent: 'text-accent-text', danger: 'text-danger' };
const TOP_LINES = 3;
const ROUND_TO = 1000;

function ReplyCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('sheen overflow-hidden rounded-2xl border border-line bg-surface shadow-(--shadow-card)', className)}>{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface-2 px-2.5 py-2 sm:px-3">
      <div className="truncate text-[11px]/4 text-fg-3">{label}</div>
      <div className="mt-0.5 font-display text-[15px]/5 font-semibold whitespace-nowrap tabular-nums">{value}</div>
    </div>
  );
}

export function EstimateReplyCard({ reply }: { reply: EstimateReply }) {
  const t = useTranslations('app.assistant');
  const tApp = useTranslations('app');
  const { lineName, lineQty } = useEngineText();
  const router = useRouter();
  const { input, result } = reply;
  const lines = [...result.mats].sort((a, b) => b.total - a.total).slice(0, TOP_LINES);
  const shares = WORK_IDS.flatMap((id) => {
    const amount = result.byCat[id] ?? 0;
    return amount > 0 ? [{ id, share: (amount / result.total) * 100 }] : [];
  });

  const open = () => {
    useDraft.getState().load(input, LAST_STEP);
    useCalculation.getState().start();
    router.push(routes.estimate(DRAFT_ESTIMATE_ID));
  };

  return (
    <ReplyCard>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs/4 text-fg-3">
          <span>{t('estimate.total')}</span>
          <span className="rounded-full border border-line px-2 py-0.5">{t('estimate.quality', { quality: tApp(`qualities.${input.quality}.name`) })}</span>
        </div>
        <div className="-mt-2 font-display text-[28px]/8 font-semibold tracking-[-0.03em] whitespace-nowrap text-accent-text tabular-nums">
          {tApp('mlnSom', { value: rangeMln(result.low, result.high) })}
        </div>
        <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {shares.map(({ id, share }) => (
            <span key={id} className="h-full" style={{ width: `${share}%`, background: CATEGORY_COLOR[id] }} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label={t('estimate.materials')} value={tApp('mln', { value: mln(result.matTotal) })} />
          <Stat label={t('estimate.labour')} value={tApp('mln', { value: mln(result.labTotal) })} />
          <Stat label={t('estimate.duration')} value={t('estimate.days', { min: result.dMin, max: result.dMax })} />
        </div>
        <div>
          <div className="text-[11px]/4 font-medium tracking-[0.05em] text-fg-3 uppercase">{t('estimate.top')}</div>
          <ul className="mt-1 text-[13px]/5 tabular-nums">
            {lines.map((line) => (
              <li key={`${line.cat}-${line.code}`} className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{lineName(line)}</span>
                  <span className="text-[11px]/4 text-fg-3">{lineQty(line)}</span>
                </span>
                <span className="shrink-0 font-medium">{fmt(line.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-line bg-surface-2 p-3">
        <Button size="sm" block className="group" onClick={open}>
          {t('estimate.open')}
          <ArrowRight size={15} strokeWidth={1.75} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
        </Button>
      </div>
    </ReplyCard>
  );
}

export function CalcReplyCard({ reply }: { reply: CalcReply }) {
  const t = useTranslations('app.assistant');
  const tApp = useTranslations('app');
  const { quantity } = useEngineText();
  const cost = Math.round(reply.output.cost / ROUND_TO) * ROUND_TO;
  const area = reply.values.A;

  return (
    <ReplyCard>
      <dl className="flex flex-col p-4 text-sm/5 tabular-nums">
        {reply.output.rows.map(({ key, value, unit, precise }) => (
          <div key={key} className="flex items-center justify-between gap-3 border-b border-line py-2 first:pt-0">
            <dt className="text-fg-2">{tApp(`calcs.rows.${key}`)}</dt>
            <dd className="shrink-0 font-semibold">{quantity(value, unit, precise)}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 pt-3">
          <dt className="text-fg-3">{t('calc.cost')}</dt>
          <dd className="font-display text-lg font-semibold text-accent-text">{tApp('money', { value: fmt(cost) })}</dd>
        </div>
      </dl>
      {reply.derived && typeof area === 'number' && (
        <p className="px-4 pb-3 text-xs/4 text-fg-3">{t('calc.derived', { value: dec(area) })}</p>
      )}
      <div className="border-t border-line bg-surface-2 p-3">
        <Button asChild variant="secondary" size="sm" block>
          <Link href={routes.calc(reply.calc)}>
            <Calculator size={15} strokeWidth={1.5} aria-hidden />
            {t('calc.open')}
          </Link>
        </Button>
      </div>
    </ReplyCard>
  );
}

export function CheckReplyCard({ reply }: { reply: CheckReply }) {
  const t = useTranslations('app.assistant');
  const tCheck = useTranslations('app.check');
  const tApp = useTranslations('app');
  const { result } = reply;

  return (
    <ReplyCard>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <p className={cn('font-display text-[22px]/7 font-semibold tracking-[-0.02em]', TONE[result.tone])}>
            {tCheck(`verdicts.${result.verdict}`, { percent: result.percent })}
          </p>
          <p className="mt-0.5 text-[13px]/5 text-fg-2 tabular-nums">{t('check.quote', { value: fmt(reply.quote) })}</p>
        </div>
        <div className="pt-1">
          <div className="relative flex h-2 gap-[3px]" aria-hidden>
            <span className="rounded-l-[4px] bg-success-soft" style={{ width: `${result.zone1}%` }} />
            <span className="bg-success opacity-45" style={{ width: `calc(${result.zone2}% - 3px)` }} />
            <span className="flex-1 rounded-r-[4px] bg-danger-soft" />
            <span
              className="absolute -top-1.5 h-5 w-1 -translate-x-1/2 rounded-[2px] bg-accent shadow-[0_0_0_3px_var(--surface)]"
              style={{ left: `${result.markerPct}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label={tCheck('stats.min')} value={tApp('mln', { value: mln(result.lo) })} />
          <Stat label={tCheck('stats.avg')} value={tApp('mln', { value: mln(result.avg) })} />
          <Stat label={tCheck('stats.max')} value={tApp('mln', { value: mln(result.hi) })} />
        </div>
        <p className="rounded-xl bg-surface-2 px-3 py-2.5 text-[13px]/5 text-fg-2">
          {result.verdict === 'expensive'
            ? tCheck('tips.expensive', { from: mln(result.avg), to: mln(result.avg * 1.05) })
            : tCheck(`tips.${result.verdict}`)}
        </p>
      </div>
      <div className="border-t border-line bg-surface-2 p-3">
        <Button asChild variant="secondary" size="sm" block>
          <Link href={routes.check}>
            <ShieldCheck size={15} strokeWidth={1.5} aria-hidden />
            {t('check.open')}
          </Link>
        </Button>
      </div>
    </ReplyCard>
  );
}

export function useReplyIntro() {
  const tA = useTranslations('app.assistant');
  const tApp = useTranslations('app');
  const { quantity } = useEngineText();

  return (reply: Reply): string => {
    switch (reply.kind) {
      case 'help':
        return reply.understood ? `${tA('help.greeting')} ${tA('examplesTitle')}` : tA('help.unknown');
      case 'ask':
        if (reply.question === 'dims' && reply.invalid) return tA('ask.dimsInvalid');
        if (reply.question === 'quote' && reply.invalid) return tA('ask.quoteInvalid');
        return tA(`ask.${reply.question}`);
      case 'estimate':
        return tA('estimate.intro', {
          room: tApp(`rooms.${reply.input.room}.name`),
          length: dec(reply.input.L),
          width: dec(reply.input.W),
        });
      case 'calc': {
        const calculator = findCalculator(reply.calc);
        return tA('calc.intro', { name: calculator ? tApp(`calcs.items.${calculator.id}.name`) : '' });
      }
      case 'check': {
        if (reply.subject.type === 'estimate') return tA('check.introEstimate', { room: tApp(`rooms.${reply.subject.room}.name`) });
        const type = CHECK_TYPES.find((item) => item.code === (reply.subject as { code: string }).code);
        return tA('check.introLabour', {
          work: tApp(`labour.${reply.subject.code}`),
          volume: type ? quantity(reply.subject.volume, type.unit) : dec(reply.subject.volume),
        });
      }
    }
  };
}

