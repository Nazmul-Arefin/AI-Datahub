/**
 * Embed Nango Connect UI and bridge its postMessage events back to the app.
 * Full-page navigation to :3009 leaves the user on Nango's "close this tab"
 * success screen; embedding keeps control so we can finish on Import Data.
 */

import { getApiBase } from './api/client.js';

export function isNangoConnectUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.searchParams.has('session_token') || parsed.port === '3009';
  } catch {
    return false;
  }
}

/**
 * @param {string} authorizationUrl
 * @param {{
 *   state?: string,
 *   onConnect?: (payload: object) => void,
 *   onClose?: () => void,
 *   onError?: (payload: object) => void,
 * }} [options]
 * @returns {() => void} cleanup
 */
export function openNangoConnectUI(authorizationUrl, options = {}) {
  const existing = document.getElementById('nango-connect-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'nango-connect-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Connect integration');
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:100000',
    'display:flex',
    'flex-direction:column',
    'background:#0b0f14',
  ].join(';');

  const bar = document.createElement('div');
  bar.style.cssText = [
    'flex:0 0 auto',
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'gap:12px',
    'padding:10px 14px',
    'background:#111827',
    'color:#e5e7eb',
    'font:600 13px/1.2 system-ui,sans-serif',
  ].join(';');
  bar.innerHTML = '<span>Connecting…</span>';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.style.cssText = [
    'border:1px solid rgba(255,255,255,.18)',
    'border-radius:8px',
    'padding:6px 12px',
    'background:transparent',
    'color:#e5e7eb',
    'cursor:pointer',
    'font:600 12px/1 system-ui,sans-serif',
  ].join(';');
  bar.appendChild(cancel);

  const iframe = document.createElement('iframe');
  iframe.title = 'Nango Connect';
  iframe.src = authorizationUrl;
  iframe.allow = 'clipboard-write';
  iframe.style.cssText = 'flex:1 1 auto;width:100%;border:0;background:#0b0f14;';

  overlay.appendChild(bar);
  overlay.appendChild(iframe);
  document.body.appendChild(overlay);

  let settled = false;

  const cleanup = () => {
    window.removeEventListener('message', onMessage);
    cancel.removeEventListener('click', onCancel);
    overlay.remove();
  };

  const finish = (handler, payload) => {
    if (settled) return;
    settled = true;
    cleanup();
    handler?.(payload);
  };

  const onCancel = () => finish(options.onClose);

  const onMessage = (event) => {
    const data = event?.data;
    if (!data || typeof data !== 'object' || typeof data.type !== 'string') return;

    // Connect UI posts to parent; accept local Nango hosts and same-origin.
    try {
      const originHost = new URL(event.origin).hostname;
      const allowed =
        originHost === 'localhost'
        || originHost === '127.0.0.1'
        || originHost.endsWith('.nango.dev')
        || event.origin === window.location.origin;
      if (!allowed) return;
    } catch {
      return;
    }

    if (data.type === 'connect') {
      finish(options.onConnect, data.payload || {});
      return;
    }
    if (data.type === 'close') {
      finish(options.onClose);
      return;
    }
    if (data.type === 'error') {
      finish(options.onError, data.payload || {});
    }
  };

  cancel.addEventListener('click', onCancel);
  window.addEventListener('message', onMessage);
  return cleanup;
}

/**
 * After Nango reports success, hit our OAuth callback so the source is
 * persisted, then land on Import Data via the stored redirectUri.
 */
export function completeConnectViaCallback(state, connectionId) {
  const code = connectionId || 'connected';
  const base = getApiBase().replace(/\/$/, '');
  const url =
    `${base}/integrations/callback`
    + `?code=${encodeURIComponent(code)}`
    + `&state=${encodeURIComponent(state || '')}`;
  window.location.href = url;
}

/**
 * Open Connect UI when the URL is Nango's; otherwise do a normal navigation.
 * @returns {boolean} true when Connect UI was opened
 */
export function launchAuthorization(authorizationUrl, state, {
  onClose,
  onError,
} = {}) {
  if (!isNangoConnectUrl(authorizationUrl)) {
    window.location.href = authorizationUrl;
    return false;
  }

  openNangoConnectUI(authorizationUrl, {
    state,
    onConnect: (payload) => {
      completeConnectViaCallback(state, payload?.connectionId);
    },
    onClose,
    onError,
  });
  return true;
}
