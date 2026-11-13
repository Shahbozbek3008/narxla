'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Segmented } from '@/components/ui/segmented';
import { Link } from '@/i18n/navigation';
import { estimate, type EstimateInput } from '@/lib/calc-engine';
import { routes } from '@/lib/routes';
import { useCheck, type VolumeHints } from '@/store/check';
import { usePriceBook } from '@/store/prices';
import { useResolvedEstimate } from '../result/useResolvedEstimate';
import { CheckForm } from './CheckForm';
import { CheckResult } from './CheckResult';
import { EstimateCheck } from './EstimateCheck';

type Mode = 'estimate' | 'single';

const GRID = 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-start gap-4';

function SingleCheck() {
  return (
    <div className={GRID}>
      <CheckForm />
      <CheckResult />
    </div>
  );
}

function EstimateWorkspace({ id }: { id: string }) {
  const t = useTranslations('app.check');
  const resolved = useResolvedEstimate(id);
  const book = usePriceBook();
  const applyHints = useCheck((state) => state.applyHints);
  const [mode, setMode] = useState<Mode>('estimate');

  const ready = resolved.state === 'ready' ? resolved : null;
  const inputKey = ready ? JSON.stringify(ready.input) : '';
  const result = useMemo(() => (inputKey ? estimate(JSON.parse(inputKey) as EstimateInput, book) : null), [inputKey, book]);
  const hintsKey = JSON.stringify(
    Object.fromEntries((result?.lab ?? []).map((line) => [line.code, line.qty])) satisfies VolumeHints,
  );

  useEffect(() => {
    if (inputKey) applyHints(JSON.parse(hintsKey) as VolumeHints);
  }, [inputKey, hintsKey, applyHints]);

  if (resolved.state === 'loading') {
    return (
      <div className={GRID}>
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }
  if (!ready || !result) return <SingleCheck />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Mode>
          label={t('modeLabel')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'estimate', label: t('modes.estimate') },
            { value: 'single', label: t('modes.single') },
          ]}
        />
        <Link
          href={routes.estimate(id)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-2 transition-colors duration-150 hover:text-fg"
        >
          <ArrowLeft size={14} strokeWidth={1.75} aria-hidden />
          {t('backToEstimate', { name: ready.name })}
        </Link>
      </div>
      {mode === 'estimate' ? (
        <div className={GRID}>
          <EstimateCheck name={ready.name} result={result} />
        </div>
      ) : (
        <SingleCheck />
      )}
    </div>
  );
}

export function CheckWorkspace() {
  const estimateId = useSearchParams().get('estimate');
  const applyHints = useCheck((state) => state.applyHints);

  useEffect(() => {
    if (!estimateId) applyHints({});
  }, [estimateId, applyHints]);

  return estimateId ? <EstimateWorkspace id={estimateId} /> : <SingleCheck />;
}
