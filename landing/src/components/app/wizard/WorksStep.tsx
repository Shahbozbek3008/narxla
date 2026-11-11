'use client';

import { CircleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ALL_WORKS, estimate, WORK_IDS } from '@/lib/calc-engine';
import { mln } from '@/lib/format';
import { draftToInput, useDraft } from '@/store/draft';
import { usePriceBook } from '@/store/prices';
import { SelectCard } from '../common/SelectCard';
import { WORK_ICONS } from './options';
import { StepHeading } from './StepHeading';

export function WorksStep({ showError }: { showError: boolean }) {
  const t = useTranslations('app');
  const draft = useDraft();
  const full = estimate({ ...draftToInput(draft), works: ALL_WORKS }, usePriceBook());
  const noneSelected = !Object.values(draft.works).some(Boolean);

  return (
    <div>
      <StepHeading title={t('wizard.works.title')} lead={t('wizard.works.lead')} />
      <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-3">
        {WORK_IDS.map((id) => {
          const Icon = WORK_ICONS[id];
          return (
            <SelectCard
              key={id}
              indicator="checkbox"
              selected={draft.works[id]}
              icon={<Icon size={20} strokeWidth={1.5} />}
              title={t(`works.${id}.name`)}
              description={t(`works.${id}.desc`)}
              footer={
                <span className="border-t border-line pt-3 text-[13px] text-fg-2 tabular-nums">
                  {t('wizard.works.estimate', { value: mln(full.byCat[id] ?? 0) })}
                </span>
              }
              onSelect={() => draft.toggleWork(id)}
            />
          );
        })}
      </div>
      {showError && noneSelected && (
        <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-danger-soft px-3.5 py-3 text-sm text-danger">
          <CircleAlert size={16} strokeWidth={1.75} aria-hidden />
          {t('wizard.works.error')}
        </div>
      )}
    </div>
  );
}
