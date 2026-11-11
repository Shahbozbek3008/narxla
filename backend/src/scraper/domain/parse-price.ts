const NUMBER_PATTERN = /\d[\d\s  .,']*/;
const GROUP_SEPARATORS = /[\s  ']/g;
const THOUSANDS_GROUP = /^\d{1,3}([.,]\d{3})+$/;

function normalize(raw: string) {
  const compact = raw.replace(GROUP_SEPARATORS, '').replace(/[.,]$/, '');
  const lastDot = compact.lastIndexOf('.');
  const lastComma = compact.lastIndexOf(',');

  if (lastDot >= 0 && lastComma >= 0) {
    const decimal = lastDot > lastComma ? '.' : ',';
    const group = decimal === '.' ? ',' : '.';
    return compact.split(group).join('').replace(decimal, '.');
  }

  if (THOUSANDS_GROUP.test(compact)) return compact.replace(/[.,]/g, '');
  return compact.replace(',', '.');
}

export function parsePrice(text: string | null | undefined): number | null {
  if (!text) return null;
  const match = NUMBER_PATTERN.exec(text);
  if (!match) return null;

  const value = Number(normalize(match[0].trim()));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : null;
}
