const DEFAULT_BASE = 'http://localhost:8000/api/v1';

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

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    throw new ApiError(error.message || 'Network error', { status: 0 });
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
    const detail = data?.detail || data?.message || response.statusText;
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
};
