const NBSP = ' ';
const DATE_TIME = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
const DATE = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' });

export const fmt = (value: number) => Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);

export const money = (value: number) => `${fmt(value)} so‘m`;

export const decimal = (value: number) => String(Number(value.toFixed(3))).replace('.', ',');

export const parseNumber = (value: string) => {
  const parsed = Number(value.replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const dateTime = (iso: string | null) => (iso ? DATE_TIME.format(new Date(iso)) : '—');

export const date = (iso: string | null) => (iso ? DATE.format(new Date(iso)) : '—');

export const hostOf = (value: string) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};
