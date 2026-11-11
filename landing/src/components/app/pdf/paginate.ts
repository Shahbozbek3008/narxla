import type { Line } from '@/lib/calc-engine';

export const PAGE = { width: 794, height: 1123 };

export const LAYOUT = {
  paddingTop: 56,
  paddingBottom: 40,
  docHeader: 184,
  pageHeader: 44,
  sectionTitle: 44,
  columnHeader: 30,
  row: 29,
  totals: 156,
  footer: 56,
};

export type SectionId = 'materials' | 'labour';

export type TableBlock = {
  kind: 'table';
  section: SectionId;
  rows: Line[];
  startIndex: number;
  continued: boolean;
};

export type PdfBlock = TableBlock | { kind: 'totals' };

export type PdfSheet = { blocks: PdfBlock[] };

const CONTENT_HEIGHT = PAGE.height - LAYOUT.paddingTop - LAYOUT.paddingBottom - LAYOUT.footer;

export function paginate(sections: { id: SectionId; lines: Line[] }[]): PdfSheet[] {
  const sheets: PdfSheet[] = [];
  let blocks: PdfBlock[] = [];
  let remaining = 0;

  const openSheet = () => {
    blocks = [];
    sheets.push({ blocks });
    remaining = CONTENT_HEIGHT - (sheets.length === 1 ? LAYOUT.docHeader : LAYOUT.pageHeader);
  };

  openSheet();

  sections.forEach(({ id, lines }) => {
    const firstChunk = LAYOUT.sectionTitle + LAYOUT.columnHeader + LAYOUT.row;
    if (remaining < firstChunk) openSheet();
    remaining -= LAYOUT.sectionTitle + LAYOUT.columnHeader;
    let table: TableBlock = { kind: 'table', section: id, rows: [], startIndex: 0, continued: false };
    blocks.push(table);

    lines.forEach((line, index) => {
      if (remaining < LAYOUT.row) {
        openSheet();
        remaining -= LAYOUT.sectionTitle + LAYOUT.columnHeader;
        table = { kind: 'table', section: id, rows: [], startIndex: index, continued: true };
        blocks.push(table);
      }
      table.rows.push(line);
      remaining -= LAYOUT.row;
    });
  });

  if (remaining < LAYOUT.totals) openSheet();
  blocks.push({ kind: 'totals' });

  return sheets;
}
