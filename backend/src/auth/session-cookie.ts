import type { CookieOptions, Response } from 'express';

export const SESSION_COOKIE = 'smetachi_session';

const DAY_MS = 24 * 60 * 60 * 1000;

const baseOptions = (secure: boolean): CookieOptions => ({ httpOnly: true, sameSite: 'lax', secure, path: '/' });

export function setSessionCookie(response: Response, token: string, ttlDays: number, secure: boolean) {
  response.cookie(SESSION_COOKIE, token, { ...baseOptions(secure), maxAge: ttlDays * DAY_MS });
}

export function clearSessionCookie(response: Response, secure: boolean) {
  response.clearCookie(SESSION_COOKIE, baseOptions(secure));
}
