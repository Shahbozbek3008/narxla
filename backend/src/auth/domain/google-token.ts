import { createPublicKey, type JsonWebKey, verify } from 'node:crypto';

export type GoogleJwk = JsonWebKey & { kid: string };

export type GoogleIdentity = { sub: string; email: string; name: string };

type Header = { alg?: unknown; kid?: unknown };

type Claims = {
  iss?: unknown;
  aud?: unknown;
  sub?: unknown;
  exp?: unknown;
  email?: unknown;
  email_verified?: unknown;
  name?: unknown;
};

const ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);
const CLOCK_SKEW_SECONDS = 60;

const decodePart = <T>(part: string): T => JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as T;

export function verifyGoogleIdToken(token: string, keys: GoogleJwk[], clientId: string, nowSeconds: number): GoogleIdentity | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [rawHeader, rawClaims, signature] = parts;

  let header: Header;
  let claims: Claims;
  try {
    header = decodePart<Header>(rawHeader);
    claims = decodePart<Claims>(rawClaims);
  } catch {
    return null;
  }

  const key = header.alg === 'RS256' ? keys.find(({ kid }) => kid === header.kid) : undefined;
  if (!key) return null;

  const signed = verify(
    'RSA-SHA256',
    Buffer.from(`${rawHeader}.${rawClaims}`),
    createPublicKey({ key, format: 'jwk' }),
    Buffer.from(signature, 'base64url'),
  );
  if (!signed) return null;

  const valid =
    typeof claims.iss === 'string' &&
    ISSUERS.has(claims.iss) &&
    claims.aud === clientId &&
    typeof claims.exp === 'number' &&
    claims.exp + CLOCK_SKEW_SECONDS > nowSeconds &&
    typeof claims.sub === 'string' &&
    typeof claims.email === 'string' &&
    claims.email_verified === true;
  if (!valid) return null;

  return {
    sub: claims.sub as string,
    email: claims.email as string,
    name: typeof claims.name === 'string' ? claims.name : '',
  };
}
