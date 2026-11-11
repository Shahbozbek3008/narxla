import { ResultScreen } from '@/components/app/result/ResultScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function EstimatePage({ params }: { params: LocaleParams<{ id: string }> }) {
  const { id } = await resolveLocale(params);
  return <ResultScreen id={id} />;
}
