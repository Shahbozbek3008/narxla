import { useTranslations } from 'next-intl';
import { Suspense } from 'react';
import { PageHeader } from '../common/PageHeader';
import { CheckWorkspace } from './CheckWorkspace';

export function CheckScreen() {
  const t = useTranslations('app.check');

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader title={t('title')} subtitle={t('lead')} />
      <Suspense>
        <CheckWorkspace />
      </Suspense>
    </div>
  );
}
