import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Calculator } from '@/lib/calc-engine';
import type { PriceStatus } from '@/lib/prices/price-book';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { Highlight } from '../common/Highlight';
import { card, interactiveCard } from '../common/styles';
import { useEngineText } from '../common/useEngineText';
import { PathIcon } from './PathIcon';

const STATUS_DOT: Record<PriceStatus, string> = {
  verified: 'bg-success',
  partial: 'bg-accent',
  estimated: 'bg-fg-3/60',
};

type CalcTileProps = {
  calculator: Calculator;
  status: PriceStatus;
  query: string;
};

export function CalcTile({ calculator, status, query }: CalcTileProps) {
  const t = useTranslations('app.calcs');
  const { calcName, calcDesc } = useEngineText();

  return (
    <Link
      href={routes.calc(calculator.id)}
      className={cn(card, interactiveCard, 'group flex items-center gap-4 p-4 active:translate-y-0 active:scale-[.99]')}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent-text shadow-[inset_0_0_0_1px_var(--accent-soft)]">
        <PathIcon path={calculator.icon} size={22} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px]/[22px] font-semibold tracking-[-0.01em]">
          <Highlight text={calcName(calculator)} query={query} />
        </span>
        <span className="truncate text-[13px]/[18px] text-fg-3">
          <Highlight text={calcDesc(calculator)} query={query} />
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs/4 text-fg-3">
          <span className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT[status])} aria-hidden />
          {t(`source.${status}.title`)}
        </span>
      </span>
      <ChevronRight
        size={18}
        strokeWidth={1.75}
        className="shrink-0 text-fg-3 transition-[translate,color] duration-200 group-hover:translate-x-0.5 group-hover:text-fg"
        aria-hidden
      />
    </Link>
  );
}
