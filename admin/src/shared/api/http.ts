export const ADMIN_KEY_HEADER = 'x-admin-key';

const UNAUTHORIZED = 401;

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

type HttpConfig = {
  getKey: () => string | null;
  onUnauthorized: () => void;
};

let config: HttpConfig = { getKey: () => null, onUnauthorized: () => undefined };

export function configureHttp(next: HttpConfig) {
  config = next;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message: string,
  ) {
    super(message);
  }

  get unauthorized() {
    return this.status === UNAUTHORIZED;
  }
}

function messageOf(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) return null;
  const { message } = payload as { message?: unknown };
  if (Array.isArray(message)) return message.join(', ');
  return typeof message === 'string' ? message : null;
}

function codeOf(payload: unknown) {
  if (typeof payload !== 'object' || payload === null) return null;
  const { code } = payload as { code?: unknown };
  return typeof code === 'string' ? code : null;
}

export async function request<T>(method: Method, path: string, body?: unknown, key = config.getKey()): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      ...(key ? { [ADMIN_KEY_HEADER]: key } : {}),
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new ApiError(response.status, codeOf(payload), messageOf(payload) ?? response.statusText);
    if (error.unauthorized) config.onUnauthorized();
    throw error;
  }
  return payload as T;
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path),
};

export const query = (params: Record<string, string | undefined>) => {
  const entries = Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]));
  return entries.length > 0 ? `?${new URLSearchParams(entries)}` : '';
};
