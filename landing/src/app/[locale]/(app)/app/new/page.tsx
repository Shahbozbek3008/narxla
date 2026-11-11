import { Suspense } from 'react';
import { NewEstimateScreen } from '@/components/app/wizard/NewEstimateScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function NewEstimatePage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return (
    <Suspense>
      <NewEstimateScreen />
    </Suspense>
  );
}
