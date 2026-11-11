import { PdfScreen } from '@/components/app/pdf/PdfScreen';
import { resolveLocale, type LocaleParams } from '@/i18n/page';

export default async function EstimatePdfPage({ params }: { params: LocaleParams<{ id: string }> }) {
  const { id } = await resolveLocale(params);
  return <PdfScreen id={id} />;
}
