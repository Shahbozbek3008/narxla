import { Injectable } from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';
import { AppConfigService } from '../config/app-config.service.js';

export type FetchFailure = 'network' | 'timeout' | 'http' | 'too-large';

export class FetchError extends Error {
  constructor(
    readonly kind: FetchFailure,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

class RetryAfterError extends FetchError {
  constructor(
    status: number,
    readonly waitMs: number,
  ) {
    super('http', `HTTP ${status}`, status);
  }
}

export type FetchedPage = { status: number; body: string };

const MAX_BODY_BYTES = 3 * 1024 * 1024;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = 1500;
const MAX_RETRY_AFTER_MS = 30_000;

const isRetryable = (error: unknown) =>
  error instanceof FetchError && (error.kind === 'network' || error.kind === 'timeout' || (error.status ?? 0) >= 500 || error.status === 429);

function retryAfterMs(response: Response) {
  const header = response.headers.get('retry-after');
  const seconds = header ? Number(header) : NaN;
  return Number.isFinite(seconds) ? Math.min(seconds * 1000, MAX_RETRY_AFTER_MS) : null;
}

@Injectable()
export class HttpFetcher {
  constructor(private readonly config: AppConfigService) {}

  async fetchText(url: string, accept = 'text/html,application/xhtml+xml'): Promise<FetchedPage> {
    let attempt = 0;
    for (;;) {
      attempt += 1;
      try {
        return await this.request(url, accept);
      } catch (error) {
        if (attempt >= MAX_ATTEMPTS || !isRetryable(error)) throw error;
        const waitMs = error instanceof RetryAfterError ? error.waitMs : BACKOFF_MS * 2 ** (attempt - 1);
        await sleep(waitMs);
      }
    }
  }

  private async request(url: string, accept: string): Promise<FetchedPage> {
    const { userAgent, requestTimeoutMs } = this.config.scraper;
    let response: Response;
    try {
      response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(requestTimeoutMs),
        headers: { 'user-agent': userAgent, accept, 'accept-language': 'uz,ru;q=0.9,en;q=0.5' },
      });
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
      throw new FetchError(timedOut ? 'timeout' : 'network', error instanceof Error ? error.message : String(error));
    }

    if (!response.ok) {
      const waitMs = retryAfterMs(response);
      if (waitMs !== null) throw new RetryAfterError(response.status, waitMs);
      throw new FetchError('http', `HTTP ${response.status}`, response.status);
    }

    const declaredLength = Number(response.headers.get('content-length') ?? 0);
    if (declaredLength > MAX_BODY_BYTES) throw new FetchError('too-large', `Body exceeds ${MAX_BODY_BYTES} bytes`);

    const body = await response.text();
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw new FetchError('too-large', `Body exceeds ${MAX_BODY_BYTES} bytes`);
    return { status: response.status, body };
  }
}
