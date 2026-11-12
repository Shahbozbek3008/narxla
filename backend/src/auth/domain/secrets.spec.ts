import { generateOtp, generateSessionToken, hashOtp, hashSessionToken, OTP_LENGTH, safeEqualHex } from './secrets.js';

describe('auth secrets', () => {
  it('generates numeric codes of fixed length', () => {
    for (let index = 0; index < 50; index += 1) expect(generateOtp()).toMatch(new RegExp(`^\\d{${OTP_LENGTH}}$`));
  });

  it('binds an OTP hash to the phone and secret', () => {
    const hash = hashOtp('secret', '+998901234567', '123456');
    expect(hash).toBe(hashOtp('secret', '+998901234567', '123456'));
    expect(hash).not.toBe(hashOtp('secret', '+998901234568', '123456'));
    expect(hash).not.toBe(hashOtp('other', '+998901234567', '123456'));
  });

  it('produces unguessable session tokens and stable hashes', () => {
    const token = generateSessionToken();
    expect(token).not.toBe(generateSessionToken());
    expect(token.length).toBeGreaterThanOrEqual(43);
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });

  it('compares hex digests safely', () => {
    expect(safeEqualHex('abcd', 'abcd')).toBe(true);
    expect(safeEqualHex('abcd', 'abce')).toBe(false);
    expect(safeEqualHex('abcd', 'abcdef')).toBe(false);
  });
});
