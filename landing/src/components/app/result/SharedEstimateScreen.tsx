'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCountUp } from '@/hooks/useCountUp';
import { Link } from '@/i18n/navigation';
import { isApiError } from '@/lib/api/client';
import { useSharedEstimate } from '@/lib/api/queries';
import { estimate } from '@/lib/calc-engine';
import { dec, rangeMln } from '@/lib/format';
import { routes } from '@/lib/routes';
import { usePriceBook } from '@/store/prices';
import { EmptyCard } from '../common/EmptyCard';
import { PageHeader } from '../common/PageHeader';
import { StickyBar, StickyTotal } from '../common/StickyBar';
import { useFormatDate } from '../common/useFormatDate';
import { EstimateBreakdown } from './EstimateBreakdown';
import { PricesSummaryBadge } from './PriceStatusBadge';
import { ResultSkeleton } from './ResultSkeleton';

const NOT_FOUND = 404;

export function SharedEstimateScreen({ token }: { token: string }) {
  const t = useTranslations('app');
  const { data, error, isError, refetch } = useSharedEstimate(token);
  const book = usePriceBook();
  const progress = useCountUp(Boolean(data));
  const formatDate = useFormatDate();

  if (isError) {
    const missing = isApiError(error) && error.status === NOT_FOUND;
    return (
      <EmptyCard
        className="mt-6"
        title={t(missing ? 'shared.missingTitle' : 'result.errorTitle')}
        text={t(missing ? 'shared.missingText' : 'result.errorText')}
        action={
          missing ? (
            <Button asChild size="sm">
              <Link href={routes.newEstimate}>{t('shared.cta')}</Link>
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              {t('result.retry')}
            </Button>
          )
        }
      />
    );
  }

  if (!data) return <ResultSkeleton />;

  const { input, name } = data;
  const result = estimate(input, book);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        className="mb-2"
        eyebrow={
          <span className="text-[13px] text-fg-3">{t('shared.eyebrow', { date: formatDate(data.createdAt.slice(0, 10), true) })}</span>
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
      />

      <EstimateBreakdown result={result} progress={progress} />
      <p className="text-center text-xs/4 text-fg-3">{t('result.sources')}</p>

      <StickyBar className="mt-2 mb-6 pl-[18px]">
        <StickyTotal label={t('result.totalLabel')} value={t('mlnSom', { value: rangeMln(result.low, result.high) })} />
        <Button asChild size="lg" className="text-sm">
          <Link href={routes.newEstimate}>
            {t('shared.cta')}
            <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
          </Link>
        </Button>
      </StickyBar>
    </div>
  );
}
