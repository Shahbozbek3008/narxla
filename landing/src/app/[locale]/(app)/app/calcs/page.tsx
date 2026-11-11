import { CalcCatalog } from '@/components/app/calcs/CalcCatalog';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function CalcsPage({ params }: { params: LocaleParams }) {
  await resolveLocale(params);
  return <CalcCatalog />;
}
