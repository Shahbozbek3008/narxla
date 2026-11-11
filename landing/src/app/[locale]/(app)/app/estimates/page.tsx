import { EstimatesScreen } from '@/components/app/estimates/EstimatesScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function EstimatesPage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return <EstimatesScreen />;
}
