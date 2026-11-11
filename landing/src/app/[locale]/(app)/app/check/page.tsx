import { CheckScreen } from '@/components/app/check/CheckScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function CheckPage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return <CheckScreen />;
}
