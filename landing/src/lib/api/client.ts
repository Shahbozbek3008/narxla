type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
};

type ErrorPayload = { code?: unknown; message?: unknown } & Record<string, unknown>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message: string,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }

  static from(status: number, payload: unknown) {
    const body: ErrorPayload = typeof payload === 'object' && payload !== null ? (payload as ErrorPayload) : {};
    const message = Array.isArray(body.message) ? body.message.join(', ') : typeof body.message === 'string' ? body.message : '';
    return new ApiError(status, typeof body.code === 'string' ? body.code : null, message || `Request failed with ${status}`, body);
  }
}

export const isApiError = (error: unknown, code?: string): error is ApiError =>
  error instanceof ApiError && (code === undefined || error.code === code);

export const isUnauthorized = (error: unknown) => error instanceof ApiError && error.status === 401;

export async function apiRequest<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    signal,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { accept: 'application/json', ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw ApiError.from(response.status, payload);
  return payload as T;
}
