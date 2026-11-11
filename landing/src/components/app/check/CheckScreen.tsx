import { useTranslations } from 'next-intl';
import { PageHeader } from '../common/PageHeader';
import { CheckForm } from './CheckForm';
import { CheckResult } from './CheckResult';

export function CheckScreen() {
  const t = useTranslations('app.check');

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader title={t('title')} subtitle={t('lead')} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] items-start gap-4">
        <CheckForm />
        <CheckResult />
      </div>
    </div>
  );
}
