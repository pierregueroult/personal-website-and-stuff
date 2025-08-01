import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';

import { env } from '../env/client';

type FetchResult<T> = FetchSuccess<T> | FetchError;

type BackendError = unknown;
type FetchSuccess<T> = { ok: true; data: T; response: ResponseOk };
type ResponseOk = Response & { ok: true };
type ResponseError = Response & { ok: false; statusText: string; status: number };
type FetchError = { ok: false; error: string; response: ResponseError; data: BackendError };

const baseFetch = async <T = object>(
  path: string,
  options: RequestInit = {},
  includeAuth = false,
): Promise<FetchResult<T>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (includeAuth) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('auth-token');
    if (authCookie) headers['Cookie'] = `auth-token=${authCookie.value}`;
  }

  const response: ResponseOk | ResponseError = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const json = await response.json().catch(() => ({}));

  return response.ok
    ? { ok: true, data: json as T, response }
    : { ok: false, error: response.statusText, response, data: json as BackendError };
};

const get = cache(async <T = object>(path: string, auth = false): Promise<FetchResult<T>> => {
  return baseFetch(path, { method: 'GET' }, auth);
});

const post = cache(
  async <T = object>(path: string, body?: unknown, auth = false): Promise<FetchResult<T>> => {
    return baseFetch(
      path,
      {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
      },
      auth,
    );
  },
);

const put = cache(
  async <T = object>(path: string, body?: unknown, auth = false): Promise<FetchResult<T>> => {
    return baseFetch(
      path,
      {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
      },
      auth,
    );
  },
);

const del = cache(
  async <T = object>(path: string, body?: unknown, auth = false): Promise<FetchResult<T>> => {
    return baseFetch(
      path,
      {
        method: 'DELETE',
        body: body ? JSON.stringify(body) : undefined,
      },
      auth,
    );
  },
);

export { get, post, put, del };
