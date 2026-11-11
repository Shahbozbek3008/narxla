'use client';

import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';
import { estimate, validate } from '@/lib/calc-engine';
import { rangeMln } from '@/lib/format';
import { DRAFT_ESTIMATE_ID, routes } from '@/lib/routes';
import { useCalculation } from '@/store/calculation';
import { draftToInput, LAST_STEP, useDraft, type DraftStep } from '@/store/draft';
import { usePriceBook } from '@/store/prices';
import { useHydrated } from '@/store/StoreHydrator';
import { PageHeader } from '../common/PageHeader';
import { StickyBar } from '../common/StickyBar';
import { DimensionsStep } from './DimensionsStep';
import { QualityStep } from './QualityStep';
import { RoomStep } from './RoomStep';
import { StepNav } from './StepNav';
import { WorksStep } from './WorksStep';

const parseStep = (value: string | null): DraftStep | null => {
  const step = Number(value) - 1;
  return value !== null && Number.isInteger(step) && step >= 0 && step <= LAST_STEP ? (step as DraftStep) : null;
};

export function NewEstimateScreen() {
  const t = useTranslations('app');
  const router = useRouter();
  const hydrated = useHydrated();
  const draft = useDraft();
  const startCalculation = useCalculation((state) => state.start);
  const [worksError, setWorksError] = useState(false);
  const initialStep = parseStep(useSearchParams().get('step'));

  useEffect(() => {
    if (hydrated && initialStep !== null) useDraft.getState().setStep(initialStep);
  }, [hydrated, initialStep]);

  const input = draftToInput(draft);
  const errors = validate(input.L, input.W, input.H, input.works);
  const result = estimate(input, usePriceBook());
  const { step } = draft;
  const dimsInvalid = step === 1 && (errors.errLW || errors.errH);
  const worksInvalid = step === 2 && errors.errWorks;
  const isLast = step === LAST_STEP;

  const goNext = () => {
    if (worksInvalid) return setWorksError(true);
    if (dimsInvalid) return;
    if (!isLast) return draft.setStep((step + 1) as DraftStep);
    startCalculation();
    router.push(routes.estimate(DRAFT_ESTIMATE_ID));
  };

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader back={{ href: routes.estimates, label: t('wizard.back') }} title={t('wizard.title')} />
      <StepNav current={step} onSelect={draft.setStep} />

      <div key={step} className="mt-[clamp(24px,4vw,40px)] flex-1 animate-step-in">
        {step === 0 && <RoomStep />}
        {step === 1 && <DimensionsStep />}
        {step === 2 && <WorksStep showError={worksError} />}
        {step === 3 && <QualityStep />}
      </div>

      <StickyBar className="mt-8 mb-6">
        <Button variant="secondary" size="lg" disabled={step === 0} onClick={() => draft.setStep((step - 1) as DraftStep)}>
          <ChevronLeft size={16} strokeWidth={1.5} aria-hidden />
          {t('wizard.prev')}
        </Button>
        <span className="flex min-w-0 flex-1 flex-col items-end text-right">
          {step > 0 && (
            <span className="hidden flex-col items-end sm:flex">
              <span className="text-xs/4 text-fg-3">{t('wizard.liveEstimate')}</span>
              <span className="font-display text-base/[22px] font-semibold whitespace-nowrap tabular-nums">
                {t('mlnSom', { value: rangeMln(result.low, result.high) })}
              </span>
            </span>
          )}
        </span>
        <Button
          size="lg"
          aria-disabled={dimsInvalid || worksInvalid}
          className="px-[18px] aria-disabled:cursor-not-allowed aria-disabled:opacity-45"
          onClick={goNext}
        >
          {isLast ? t('wizard.calculate') : t('wizard.next')}
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden />
        </Button>
      </StickyBar>
    </div>
  );
}
