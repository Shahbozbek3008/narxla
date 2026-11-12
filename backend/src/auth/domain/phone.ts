const COUNTRY_CODE = '998';
const NATIONAL_LENGTH = 9;

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  const national = digits.length === COUNTRY_CODE.length + NATIONAL_LENGTH && digits.startsWith(COUNTRY_CODE)
    ? digits.slice(COUNTRY_CODE.length)
    : digits;
  if (national.length !== NATIONAL_LENGTH) return null;
  return `+${COUNTRY_CODE}${national}`;
}

export const maskPhone = (phone: string) => `${phone.slice(0, 6)}***${phone.slice(-4)}`;
