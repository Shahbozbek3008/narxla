import { CalcDetail } from '@/components/app/calcs/CalcDetail';
import { resolveLocale, type LocaleParams } from '@/i18n/page';
import { CALCULATORS } from '@/lib/calc-engine';

export function generateStaticParams() {
  return CALCULATORS.map(({ id }) => ({ id }));
}

export default async function CalcPage({ params }: { params: LocaleParams<{ id: string }> }) {
  const { id } = await resolveLocale(params);
  return <CalcDetail id={id} />;
}
