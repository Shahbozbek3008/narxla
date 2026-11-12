const NBSP = ' ';

export const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);

export const dec = (n: number, digits = 1) => n.toFixed(digits).replace('.', ',');

export const mln = (n: number) => (n / 1e6).toFixed(1).replace('.', ',');

export const num = (value: string) => {
  const parsed = parseFloat(String(value).replace(',', '.'));
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const rangeMln = (low: number, high: number) => `${mln(low)}–${mln(high)}`;

export const digitsOnly = (value: string, maxLength: number) => value.replace(/\D/g, '').slice(0, maxLength);

export const formatPhone = (phone: string) => {
  const match = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  return match ? `+998 ${match.slice(1).join(' ')}` : phone;
};
