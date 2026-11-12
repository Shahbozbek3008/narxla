import { maskPhone, normalizePhone } from './phone.js';

describe('normalizePhone', () => {
  it.each([
    ['901234567', '+998901234567'],
    ['90 123 45 67', '+998901234567'],
    ['+998 (90) 123-45-67', '+998901234567'],
    ['998901234567', '+998901234567'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(['', '12345', '+7 900 123 45 67', '99890123456789'])('rejects %s', (input) => {
    expect(normalizePhone(input)).toBeNull();
  });

  it('masks the middle of a phone number', () => {
    expect(maskPhone('+998901234567')).toBe('+99890***4567');
  });
});
