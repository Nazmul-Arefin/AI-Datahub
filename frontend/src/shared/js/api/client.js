const DEFAULT_BASE = 'http://127.0.0.1:8000/api/v1';

export function getApiBase() {
  return (typeof window !== 'undefined' && window.__WEEple_API__) || DEFAULT_BASE;
}

export function isApiEnabled() {
  return Boolean(getApiBase());
}

export class ApiError extends Error {
  constructor(message, { status = 0, body = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch(path, options = {}) {
  const base = getApiBase().replace(/\/$/, '');
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const token = typeof window !== 'undefined' ? window.__WEEple_TOKEN__ : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const timeoutMs = Number(options.timeoutMs) > 0 ? Number(options.timeoutMs) : 12000;
  const controller = new AbortController();
  const externalSignal = options.signal;
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    const { timeoutMs: _t, signal: _s, ...fetchOptions } = options;
    response = await fetch(url, { ...fetchOptions, headers, signal: controller.signal });
  } catch (error) {
    const aborted = error?.name === 'AbortError';
    throw new ApiError(aborted ? 'Request timed out' : (error.message || 'Network error'), {
      status: 0,
    });
  } finally {
    window.clearTimeout(timer);
    if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const nested = data?.error;
    const detail = nested?.message || data?.detail || data?.message || response.statusText;
    throw new ApiError(typeof detail === 'string' ? detail : 'Request failed', {
      status: response.status,
      body: data,
    });
  }

  return data;
}

export const api = {
  get: (path) => apiFetch(path),
  post: (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path, body) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: 'DELETE' }),
};
