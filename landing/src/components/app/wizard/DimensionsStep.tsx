'use client';

import { useTranslations } from 'next-intl';
import { estimate, LIMITS, validate } from '@/lib/calc-engine';
import { cn } from '@/lib/utils';
import { draftToInput, useDraft } from '@/store/draft';
import { usePriceBook } from '@/store/prices';
import { CountStepper } from '../common/CountStepper';
import { FieldError, NumberField } from '../common/NumberField';
import { card } from '../common/styles';
import { RoomDiagram } from './RoomDiagram';
import { StepHeading } from './StepHeading';

export function DimensionsStep() {
  const t = useTranslations('app');
  const draft = useDraft();
  const input = draftToInput(draft);
  const errors = validate(input.L, input.W, input.H, input.works);
  const result = estimate(input, usePriceBook());

  return (
    <div>
      <StepHeading title={t('wizard.dims.title', { room: t(`rooms.${draft.room}.name`) })} lead={t('wizard.dims.lead')} />
      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-4">
        <div className={cn(card, 'flex flex-col gap-[18px] p-5')}>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('wizard.dims.length')}
              unit="m"
              value={draft.L}
              invalid={errors.errL}
              onChange={(event) => draft.setDimension('L', event.target.value)}
            />
            <NumberField
              label={t('wizard.dims.width')}
              unit="m"
              value={draft.W}
              invalid={errors.errW}
              onChange={(event) => draft.setDimension('W', event.target.value)}
            />
          </div>
          {errors.errLW && (
            <div className="-mt-2">
              <FieldError>{t('wizard.dims.errLW')}</FieldError>
            </div>
          )}
          <NumberField
            label={t('wizard.dims.height')}
            unit="m"
            value={draft.H}
            invalid={errors.errH}
            hint={t('wizard.dims.heightHint')}
            error={errors.errH && <FieldError>{t('wizard.dims.errH')}</FieldError>}
            onChange={(event) => draft.setDimension('H', event.target.value)}
          />
          <div className="h-px bg-line" />
          <CountStepper
            label={t('wizard.dims.doors')}
            hint={t('wizard.dims.doorsHint')}
            value={draft.doors}
            max={LIMITS.doors}
            decreaseLabel={t('wizard.dims.decrease')}
            increaseLabel={t('wizard.dims.increase')}
            onChange={draft.setDoors}
          />
          <CountStepper
            label={t('wizard.dims.windows')}
            hint={t('wizard.dims.windowsHint')}
            value={draft.windows}
            max={LIMITS.windows}
            decreaseLabel={t('wizard.dims.decrease')}
            increaseLabel={t('wizard.dims.increase')}
            onChange={draft.setWindows}
          />
        </div>
        <RoomDiagram
          length={input.L}
          width={input.W}
          height={input.H}
          lengthLabel={draft.L}
          widthLabel={draft.W}
          heightLabel={draft.H}
          doors={draft.doors}
          windows={draft.windows}
          area={result.area}
          walls={result.walls}
          perimeter={result.perim}
        />
      </div>
    </div>
  );
}
