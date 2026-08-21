import { ApiError, isApiEnabled } from '../api/client.js';
import { login, register, fetchMe } from '../api/auth.js';
import { waitForAuthGate, showAuthGate, hideAuthGate, initAuthGateUi, resolveAuthGate } from '../auth-gate.js';


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

export function clearAccessToken() {
  setAccessToken(null);
}

function tokenFromResponse(tokenResponse) {
  return tokenResponse?.accessToken || tokenResponse?.access_token || null;
}

export async function loginAndStore(username, password) {
  const tokenResponse = await login(username, password);
  const token = tokenFromResponse(tokenResponse);
  if (!token) throw new ApiError('Login did not return a token', { status: 500, body: tokenResponse });
  setAccessToken(token);
  return tokenResponse;
}

export async function registerAndStore({ username, password, displayName } = {}) {
  const tokenResponse = await register({ username, password, displayName });
  const token = tokenFromResponse(tokenResponse);
  if (!token) throw new ApiError('Register did not return a token', { status: 500, body: tokenResponse });
  setAccessToken(token);
  return tokenResponse;
}

export async function logout() {
  clearAccessToken();
  showAuthGate();
}

async function profileFromToken() {
  const existing = getStoredToken();
  if (!existing) return null;
  setAccessToken(existing);
  try {
    return await fetchMe();
  } catch (_error) {
    // Don't wipe a token that login/register just stored while this check was in flight.
    if (getStoredToken() === existing) clearAccessToken();
    return null;
  }
}

let authInFlight = null;

/**
 * Valid JWT → /me. Otherwise wait for the auth gate (sign in / create account).
 * No silent auto-login.
 */
export async function ensureAuthenticated() {
  initAuthGateUi();

  if (!isApiEnabled()) {
    hideAuthGate();
    return null;
  }

  if (authInFlight) return authInFlight;

  authInFlight = (async () => {
    // Wire handlers immediately so Sign in / Create account work even while
    // a stale-token /me request is timing out.
    const gateReady = waitForAuthGate({
      onLogin: async (username, password) => {
        await loginAndStore(username, password);
        return fetchMe();
      },
      onRegister: async ({ username, password, displayName }) => {
        await registerAndStore({ username, password, displayName });
        return fetchMe();
      },
    });

    const existingProfile = await profileFromToken();
    if (existingProfile) {
      resolveAuthGate();
      hideAuthGate();
      return existingProfile;
    }

    await gateReady;
    hideAuthGate();
    return profileFromToken();
  })();

  try {
    return await authInFlight;
  } finally {
    authInFlight = null;
  }
}
