import { createSign, generateKeyPairSync } from 'node:crypto';
import { type GoogleJwk, verifyGoogleIdToken } from './google-token.js';

const CLIENT_ID = 'client.apps.googleusercontent.com';
const NOW = 1_800_000_000;

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const KEYS: GoogleJwk[] = [{ ...publicKey.export({ format: 'jwk' }), kid: 'k1' }];

const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');

function sign(claims: object, kid = 'k1') {
  const body = `${encode({ alg: 'RS256', kid })}.${encode(claims)}`;
  const signature = createSign('RSA-SHA256').update(body).sign(privateKey).toString('base64url');
  return `${body}.${signature}`;
}

const VALID = {
  iss: 'https://accounts.google.com',
  aud: CLIENT_ID,
  sub: '1234567890',
  exp: NOW + 600,
  email: 'user@example.com',
  email_verified: true,
  name: 'Test User',
};

describe('verifyGoogleIdToken', () => {
  it('accepts a correctly signed token', () => {
    expect(verifyGoogleIdToken(sign(VALID), KEYS, CLIENT_ID, NOW)).toEqual({
      sub: VALID.sub,
      email: VALID.email,
      name: VALID.name,
    });
  });

  it('rejects another audience', () => {
    expect(verifyGoogleIdToken(sign({ ...VALID, aud: 'other' }), KEYS, CLIENT_ID, NOW)).toBeNull();
  });

  it('rejects expired tokens and unverified emails', () => {
    expect(verifyGoogleIdToken(sign({ ...VALID, exp: NOW - 120 }), KEYS, CLIENT_ID, NOW)).toBeNull();
    expect(verifyGoogleIdToken(sign({ ...VALID, email_verified: false }), KEYS, CLIENT_ID, NOW)).toBeNull();
  });

  it('rejects tampered payloads and unknown keys', () => {
    const [header, , signature] = sign(VALID).split('.');
    expect(verifyGoogleIdToken(`${header}.${encode({ ...VALID, sub: 'evil' })}.${signature}`, KEYS, CLIENT_ID, NOW)).toBeNull();
    expect(verifyGoogleIdToken(sign(VALID, 'missing'), KEYS, CLIENT_ID, NOW)).toBeNull();
    expect(verifyGoogleIdToken('not-a-token', KEYS, CLIENT_ID, NOW)).toBeNull();
  });
});
