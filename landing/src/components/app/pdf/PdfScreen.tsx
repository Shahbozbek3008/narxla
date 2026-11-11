'use client';

import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { estimate } from '@/lib/calc-engine';
import { routes } from '@/lib/routes';
import { usePriceBook } from '@/store/prices';
import { PageHeader } from '../common/PageHeader';
import { todayIso, useFormatDate } from '../common/useFormatDate';
import { useNotify } from '../common/useNotify';
import { ResultSkeleton } from '../result/ResultSkeleton';
import { useResolvedEstimate } from '../result/useResolvedEstimate';
import { PdfPage, type PdfDocument } from './PdfPage';
import { PAGE, paginate } from './paginate';

const DOCUMENT_NUMBER = '0143';
const PAGE_GAP = 24;

function usePageScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(1, entry.contentRect.width / PAGE.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, scale };
}

function PdfPreview({ document, scale }: { document: PdfDocument; scale: number }) {
  const sheets = useMemo(
    () =>
      paginate([
        { id: 'materials', lines: document.result.mats },
        { id: 'labour', lines: document.result.lab },
      ]),
    [document.result],
  );

  return (
    <div className="flex flex-col items-center" style={{ gap: PAGE_GAP * scale }}>
      {sheets.map((sheet, index) => (
        <div key={index} className="relative shrink-0" style={{ width: PAGE.width * scale, height: PAGE.height * scale }}>
          <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
            <PdfPage document={document} blocks={sheet.blocks} page={index + 1} pages={sheets.length} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PdfScreen({ id }: { id: string }) {
  const t = useTranslations('app');
  const resolved = useResolvedEstimate(id);
  const formatDate = useFormatDate();
  const notify = useNotify();
  const { ref, scale } = usePageScale();
  const book = usePriceBook();

  const document = useMemo<PdfDocument | null>(() => {
    if (resolved.state !== 'ready') return null;
    return {
      name: resolved.name,
      input: resolved.input,
      result: estimate(resolved.input, book),
      number: DOCUMENT_NUMBER,
      date: formatDate(resolved.project?.createdAt ?? todayIso(), true),
    };
  }, [resolved, formatDate, book]);

  const fileName = `smeta-${(document?.name ?? '').toLowerCase().replace(/\s+/g, '-')}-${DOCUMENT_NUMBER}.pdf`;

  return (
    <div className="flex flex-col gap-4 pb-12">
      <PageHeader
        size="sm"
        align="center"
        back={{ href: routes.estimate(id), label: t('pdf.back') }}
        title={t('pdf.title')}
        actions={
          <>
            <Button variant="secondary" size="md" onClick={() => notify('print', 'info')}>
              {t('pdf.print')}
            </Button>
            <Button size="md" className="px-4" disabled={!document} onClick={() => notify('downloaded', 'success', { file: fileName })}>
              <Download size={15} strokeWidth={1.75} aria-hidden />
              {t('pdf.download')}
            </Button>
          </>
        }
      />
      <div className="flex justify-center overflow-hidden rounded-[20px] border border-line bg-surface-2 p-[clamp(12px,3vw,32px)]">
        <div ref={ref} className="w-full max-w-[794px]">
          {document ? <PdfPreview document={document} scale={scale} /> : <ResultSkeleton />}
        </div>
      </div>
    </div>
  );
}
