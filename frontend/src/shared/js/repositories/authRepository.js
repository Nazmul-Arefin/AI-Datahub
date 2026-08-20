import { ApiError, isApiEnabled } from '../api/client.js';
import { login, fetchMe } from '../api/auth.js';

const TOKEN_KEY = 'weeple-access-token';

export function getStoredToken() {
  try {
    return window.__WEEple_TOKEN__ || sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
  } catch (_error) {
    return window.__WEEple_TOKEN__ || null;
  }
}

export function setAccessToken(token) {
  if (typeof window === 'undefined') return;
  window.__WEEple_TOKEN__ = token || null;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (_error) { /* storage optional */ }
}

export async function ensureAuthenticated() {
  if (!isApiEnabled()) return null;
  const existing = getStoredToken();
  if (existing) {
    setAccessToken(existing);
    try {
      return await fetchMe();
    } catch (_error) {
      setAccessToken(null);
    }
  }
  const username = (typeof window !== 'undefined' && window.__WEEple_USER__) || 'admin';
  const password = (typeof window !== 'undefined' && window.__WEEple_PASS__) || 'weeple';
  try {
    const tokenResponse = await login(username, password);
    const token = tokenResponse?.access_token || tokenResponse?.accessToken;
    if (token) setAccessToken(token);
    try {
      return await fetchMe();
    } catch (_error) {
      return { username, display_name: username };
    }
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[authRepository] login unavailable', error);
    return null;
  }
}
