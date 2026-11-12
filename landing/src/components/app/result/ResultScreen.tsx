'use client';

import { Bookmark, Download, Flag, Pencil, Share2, ShieldCheck, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/useCountUp';
import { Link } from '@/i18n/navigation';
import { estimate, type EstimateInput } from '@/lib/calc-engine';
import { dec, rangeMln } from '@/lib/format';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { useCalculation } from '@/store/calculation';
import { usePriceBook } from '@/store/prices';
import type { EstimateRecord } from '@/lib/api/types';
import { useDialogs } from '@/store/dialogs';
import { EmptyCard } from '../common/EmptyCard';
import { PageHeader } from '../common/PageHeader';
import { StickyBar, StickyTotal } from '../common/StickyBar';
import { EstimateBreakdown } from './EstimateBreakdown';
import { PricesSummaryBadge } from './PriceStatusBadge';
import { ResultSkeleton } from './ResultSkeleton';
import { useEstimateActions } from './useEstimateActions';
import { useResolvedEstimate } from './useResolvedEstimate';

const CALCULATION_DELAY = 1500;

export function ResultScreen({ id }: { id: string }) {
  const t = useTranslations('app.result');
  const resolved = useResolvedEstimate(id);

  if (resolved.state === 'loading') return <ResultSkeleton />;
  if (resolved.state === 'error') {
    return (
      <EmptyCard
        className="mt-6"
        title={t('errorTitle')}
        text={t('errorText')}
        action={
          <Button variant="secondary" size="sm" onClick={resolved.retry}>
            {t('retry')}
          </Button>
        }
      />
    );
  }
  if (resolved.state === 'missing') {
    return (
      <EmptyCard
        className="mt-6"
        title={t('notFoundTitle')}
        text={t('notFoundText')}
        action={
          <Button asChild variant="secondary" size="sm">
            <Link href={routes.estimates}>{t('notFoundCta')}</Link>
          </Button>
        }
      />
    );
  }

  return <ResultView id={id} input={resolved.input} name={resolved.name} project={resolved.project} />;
}

type ResultViewProps = {
  id: string;
  input: EstimateInput;
  name: string;
  project: EstimateRecord | null;
};

function ResultView({ id, input, name, project }: ResultViewProps) {
  const t = useTranslations('app');
  const { pending, finish } = useCalculation();
  const book = usePriceBook();
  const result = estimate(input, book);
  const progress = useCountUp(!pending);
  const actions = useEstimateActions({ id, input, name, project });
  const openDialog = useDialogs((state) => state.open);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(finish, CALCULATION_DELAY);
    return () => window.clearTimeout(timer);
  }, [pending, finish]);

  const range = t('mlnSom', { value: rangeMln(result.low, result.high) });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        className="mb-2"
        eyebrow={
          <div className="flex items-center gap-1.5 text-[13px] text-fg-3">
            <Link href={routes.estimates} className="transition-colors duration-150 hover:text-fg">
              {t('result.breadcrumb')}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-fg-2">{name}</span>
          </div>
        }
        title={t('result.title', { name, length: dec(input.L), width: dec(input.W) })}
        subtitle={
          <div className="mt-1.5 flex flex-wrap gap-2 text-xs/[22px]">
            <PricesSummaryBadge lines={result.mats} />
            <Badge tone="outline" shape="status">
              {t('result.qualityBadge', { quality: t(`qualities.${input.quality}.name`) })}
            </Badge>
            <Badge tone="outline" shape="status">
              {t('result.region')}
            </Badge>
          </div>
        }
        actions={
          <>
            <Button variant="secondary" size="sm" className="h-[38px]" onClick={actions.edit}>
              <Pencil size={15} strokeWidth={1.5} aria-hidden />
              {t('result.edit')}
            </Button>
            {project && (
              <Button
                variant="secondary"
                size="sm"
                className="h-[38px] text-danger hover:border-danger hover:text-danger"
                aria-label={t('result.delete')}
                onClick={() => openDialog('deleteEstimate', project.id)}
              >
                <Trash2 size={15} strokeWidth={1.5} aria-hidden />
              </Button>
            )}
            <Button asChild variant="secondary" size="sm" className="h-[38px]">
              <Link href={routes.check}>
                <ShieldCheck size={15} strokeWidth={1.5} aria-hidden />
                {t('result.check')}
              </Link>
            </Button>
          </>
        }
      />

      {pending ? (
        <ResultSkeleton />
      ) : (
        <>
          <EstimateBreakdown result={result} progress={progress} />
          <div className="flex flex-col items-center gap-2 text-center text-xs/4 text-fg-3">
            <span>{t('result.sources')}</span>
            <button
              type="button"
              onClick={actions.report}
              className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line-2 px-2.5 text-xs font-medium text-fg-2 transition-colors duration-150 hover:border-fg-3 hover:bg-surface-2 hover:text-fg"
            >
              <Flag size={13} strokeWidth={1.75} aria-hidden />
              {t('result.report')}
            </button>
          </div>

          <StickyBar className="mt-2 mb-6 pl-[18px]">
            <StickyTotal label={t('result.totalLabel')} value={range} />
            <Button
              variant="secondary"
              size="lg"
              className={cn('text-sm max-sm:px-3', actions.saved && 'text-accent-text')}
              aria-label={t('result.save')}
              disabled={actions.saving}
              onClick={actions.save}
            >
              <Bookmark size={16} strokeWidth={1.5} fill={actions.saved ? 'currentColor' : 'none'} aria-hidden />
              <span className="max-sm:hidden">{actions.saved ? t('result.saved') : t('result.save')}</span>
            </Button>
            <Button variant="secondary" size="lg" className="text-sm max-sm:px-3" aria-label={t('result.share')} onClick={actions.share}>
              <Share2 size={16} strokeWidth={1.5} aria-hidden />
              <span className="max-sm:hidden">{t('result.share')}</span>
            </Button>
            <Button size="lg" className="text-sm" onClick={actions.openPdf}>
              <Download size={16} strokeWidth={1.75} aria-hidden />
              {t('result.pdf')}
            </Button>
          </StickyBar>
        </>
      )}
    </div>
  );
}
