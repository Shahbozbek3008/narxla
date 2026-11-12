import { SharedEstimateScreen } from '@/components/app/result/SharedEstimateScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function SharedEstimatePage({ params }: { params: LocaleParams<{ token: string }> }) {
  const { token } = await resolveLocale(params);
  return <SharedEstimateScreen token={token} />;
}
