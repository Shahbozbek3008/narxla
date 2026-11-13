import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error.js';
import { AppConfigService } from '../config/app-config.service.js';
import { type GoogleIdentity, type GoogleJwk, verifyGoogleIdToken } from './domain/google-token.js';

const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const DEFAULT_CACHE_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5000;
const SECOND_MS = 1000;
const MAX_AGE = /max-age=(\d+)/;

@Injectable()
export class GoogleVerifier {
  private cache: { keys: GoogleJwk[]; expiresAt: number } | null = null;

  constructor(private readonly config: AppConfigService) {}

  async verify(credential: string): Promise<GoogleIdentity> {
    const { googleClientId } = this.config.auth;
    if (!googleClientId) {
      throw new ApiError(HttpStatus.SERVICE_UNAVAILABLE, 'GOOGLE_DISABLED', 'Google sign-in is not configured');
    }
    const identity = verifyGoogleIdToken(credential, await this.keys(), googleClientId, Math.floor(Date.now() / SECOND_MS));
    if (!identity) throw new ApiError(HttpStatus.UNAUTHORIZED, 'GOOGLE_INVALID', 'Google sign-in could not be verified');
    return identity;
  }

  private async keys() {
    if (this.cache && this.cache.expiresAt > Date.now()) return this.cache.keys;
    const response = await fetch(CERTS_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).catch(() => null);
    if (!response?.ok) {
      throw new ApiError(HttpStatus.SERVICE_UNAVAILABLE, 'GOOGLE_UNAVAILABLE', 'Google keys could not be loaded');
    }
    const { keys } = (await response.json()) as { keys: GoogleJwk[] };
    const maxAge = MAX_AGE.exec(response.headers.get('cache-control') ?? '');
    this.cache = { keys, expiresAt: Date.now() + (maxAge ? Number(maxAge[1]) * SECOND_MS : DEFAULT_CACHE_MS) };
    return keys;
  }
}
