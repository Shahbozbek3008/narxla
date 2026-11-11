import { useTranslations } from 'next-intl';
import { LogoMark } from '@/components/brand/Logo';
import { qtyLabel, type Estimate, type EstimateInput, type Line, type MaterialLine } from '@/lib/calc-engine';
import { BRAND_NAME } from '@/lib/config';
import { dec, fmt, rangeMln } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { PdfBlock, TableBlock } from './paginate';

const COLUMN_KEYS = ['index', 'name', 'qty', 'price', 'total'] as const;
const ROW = 'grid grid-cols-[24px_minmax(0,1fr)_80px_90px_100px] items-center gap-2';
const isEstimated = (line: Line | MaterialLine) => 'status' in line && line.status !== 'verified';
const BRAND = 'flex items-center gap-2.5 [--accent:var(--brand-amber-light)] [--accent-ink:#1A1206]';

export type PdfDocument = {
  name: string;
  input: EstimateInput;
  result: Estimate;
  number: string;
  date: string;
};

type PdfPageProps = {
  document: PdfDocument;
  blocks: PdfBlock[];
  page: number;
  pages: number;
};

function DocumentHeader({ name, input, result, number, date }: PdfDocument) {
  const t = useTranslations('app');
  const info = [
    { label: t('pdf.info.object'), value: name },
    { label: t('pdf.info.dims'), value: `${dec(input.L)} × ${dec(input.W)} × ${dec(input.H)} m` },
    { label: t('pdf.info.floor'), value: `${dec(result.area)} m²` },
    { label: t('pdf.info.qualityRegion'), value: t('pdf.qualityRegion', { quality: t(`qualities.${input.quality}.name`) }) },
  ];

  return (
    <div className="h-[184px] shrink-0">
      <header className="flex h-9 items-start justify-between">
        <span className={BRAND}>
          <LogoMark size={30} />
          <span className="font-display text-lg font-semibold tracking-[-0.02em]">{BRAND_NAME}</span>
        </span>
        <span className="text-right leading-4 tabular-nums">
          <span className="block font-mono text-[11px] text-paper-muted">{t('pdf.number', { number })}</span>
          <span className="block text-paper-text">{date}</span>
        </span>
      </header>
      <h2 className="mt-9 font-display text-[28px]/[34px] font-semibold tracking-[-0.03em]">{t('pdf.docTitle')}</h2>
      <dl className="mt-4 grid h-[62px] grid-cols-4 items-center border-y border-paper-line tabular-nums">
        {info.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-[10px] tracking-[0.05em] text-paper-muted uppercase">{label}</dt>
            <dd className="truncate font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function PageHeader({ number }: { number: string }) {
  const t = useTranslations('app.pdf');
  return (
    <header className="flex h-11 shrink-0 items-start justify-between border-b border-paper-line">
      <span className={BRAND}>
        <LogoMark size={22} />
        <span className="font-display text-sm font-semibold tracking-[-0.02em]">{BRAND_NAME}</span>
      </span>
      <span className="font-mono text-[11px] text-paper-muted tabular-nums">{t('number', { number })}</span>
    </header>
  );
}

function LinesTable({ block }: { block: TableBlock }) {
  const t = useTranslations('app.pdf');
  const columnsKey = block.section === 'materials' ? 'materialColumns' : 'labourColumns';

  return (
    <div className="shrink-0">
      <div className="flex h-11 items-end gap-1.5 pb-2 text-[13px] font-semibold">
        {t(block.section)}
        {block.continued && <span className="font-normal text-paper-muted">{t('continued')}</span>}
      </div>
      <div className={cn(ROW, 'h-[30px] border-b border-paper-ink text-[10px] tracking-[0.04em] text-paper-text uppercase')}>
        {COLUMN_KEYS.map((key, index) => (
          <span key={key} className={cn(index > 1 && 'text-right')}>
            {t(`${columnsKey}.${key}`)}
          </span>
        ))}
      </div>
      {block.rows.map((line, index) => (
        <div key={line.name} className={cn(ROW, 'h-[29px] border-b border-paper-line-soft tabular-nums')}>
          <span className="text-paper-muted">{block.startIndex + index + 1}</span>
          <span className="truncate">{line.name}</span>
          <span className="text-right whitespace-nowrap">{qtyLabel(line)}</span>
          <span className="text-right">
            {fmt(line.price)}
            {isEstimated(line) && <span className="text-paper-muted">*</span>}
          </span>
          <span className="text-right font-medium">{fmt(line.total)}</span>
        </div>
      ))}
    </div>
  );
}

function Totals({ result }: { result: Estimate }) {
  const t = useTranslations('app');
  const money = (value: number) => t('money', { value: fmt(value) });

  return (
    <div className="flex h-[156px] shrink-0 items-start justify-end pt-6">
      <div className="flex w-[300px] flex-col gap-1.5 tabular-nums">
        <div className="flex justify-between">
          <span className="text-paper-text">{t('pdf.totals.materials')}</span>
          <span>{money(result.matTotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-paper-text">{t('pdf.totals.labour')}</span>
          <span>{money(result.labTotal)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-paper-ink pt-2.5 text-sm font-semibold">
          <span>{t('pdf.totals.total')}</span>
          <span>{money(result.total)}</span>
        </div>
        <div className="mt-1.5 flex justify-between rounded-lg bg-paper-total px-3 py-2.5 font-semibold">
          <span>{t('pdf.totals.range')}</span>
          <span className="text-paper-total-ink">{t('mlnSom', { value: rangeMln(result.low, result.high) })}</span>
        </div>
      </div>
    </div>
  );
}

export function PdfPage({ document, blocks, page, pages }: PdfPageProps) {
  const t = useTranslations('app.pdf');
  const tables = blocks.filter((block): block is TableBlock => block.kind === 'table');
  const hasTotals = blocks.some((block) => block.kind === 'totals');
  const hasEstimated = tables.some((block) => block.rows.some(isEstimated));

  return (
    <article className="flex h-[1123px] w-[794px] flex-col overflow-hidden bg-paper px-14 pt-14 pb-10 font-sans text-xs/[18px] text-paper-ink shadow-[0_1px_2px_rgba(0,0,0,.1),0_24px_64px_-16px_rgba(0,0,0,.35)]">
      {page === 1 ? <DocumentHeader {...document} /> : <PageHeader number={document.number} />}

      {tables.map((block) => (
        <LinesTable key={`${block.section}-${block.startIndex}`} block={block} />
      ))}
      {hasTotals && <Totals result={document.result} />}
      <div className="flex-1" />

      <footer className="flex h-14 shrink-0 items-end justify-between gap-6 text-[10px] text-paper-muted">
        <span className="flex w-full justify-between border-t border-paper-line pt-3">
          <span>
            {t('footer')} {hasEstimated && t('estimatedNote')}
          </span>
          <span className="whitespace-nowrap tabular-nums">{t('site', { page, pages })}</span>
        </span>
      </footer>
    </article>
  );
}
