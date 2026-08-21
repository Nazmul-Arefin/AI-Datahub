/**
 * Full-bleed auth gate outside the OS shell.
 * Resolves once the user signs in or creates an account successfully.
 */

import {
  startAuthAtmosphere,
  stopAuthAtmosphere,
  markAuthSuccessAtmosphere,
  updateAuthTabPill,
  setSubmitBusy,
} from './auth-atmosphere.js';

let gatePromise = null;
let gateResolve = null;
let handlers = null;

function gateEl() {
  return document.getElementById('authGate');
}

function setError(el, message) {
  if (!el) return;
  if (!message) {
    el.hidden = true;
    el.textContent = '';
    el.classList.remove('is-visible');
    return;
  }
  el.hidden = false;
  el.textContent = message;
  el.classList.remove('is-visible');
  // Retrigger shake animation
  void el.offsetWidth;
  el.classList.add('is-visible');
}

function setMode(mode) {
  const signInTab = document.getElementById('authTabSignIn');
  const createTab = document.getElementById('authTabCreate');
  const signInForm = document.getElementById('authFormSignIn');
  const createForm = document.getElementById('authFormCreate');
  const isCreate = mode === 'create';

  signInTab?.classList.toggle('is-active', !isCreate);
  createTab?.classList.toggle('is-active', isCreate);
  signInTab?.setAttribute('aria-selected', String(!isCreate));
  createTab?.setAttribute('aria-selected', String(isCreate));
  updateAuthTabPill(isCreate ? 'create' : 'signin');

  if (signInForm) {
    signInForm.classList.toggle('is-active', !isCreate);
    signInForm.hidden = isCreate;
  }
  if (createForm) {
    createForm.classList.toggle('is-active', isCreate);
    createForm.hidden = !isCreate;
  }

  setError(document.getElementById('authSignInError'), '');
  setError(document.getElementById('authCreateError'), '');

  window.requestAnimationFrame(() => {
    const focusId = isCreate ? 'authCreateUsername' : 'authSignInUsername';
    document.getElementById(focusId)?.focus();
  });
}

export function showAuthGate() {
  document.body.classList.add('auth-pending');
  const gate = gateEl();
  if (!gate) return;
  gate.hidden = false;
  gate.classList.remove('is-dismissed', 'is-booting-out', 'is-authenticated');
  gate.setAttribute('aria-hidden', 'false');
  initAuthGateUi();
  startAuthAtmosphere();
  updateAuthTabPill('signin');
}

export function hideAuthGate() {
  document.body.classList.remove('auth-pending');
  const gate = gateEl();
  if (!gate) return;
  gate.classList.add('is-booting-out', 'is-dismissed');
  gate.setAttribute('aria-hidden', 'true');
  markAuthSuccessAtmosphere();
  stopAuthAtmosphere();
  window.setTimeout(() => {
    if (!document.body.classList.contains('auth-pending')) {
      gate.hidden = true;
      gate.classList.remove('is-booting-out');
    }
  }, 560);
}

async function runLogin(username, password, errorEl, submit) {
  setError(errorEl, '');
  if (!handlers?.onLogin) {
    setError(errorEl, 'Still connecting to Weeple… try again in a moment');
    return;
  }
  setSubmitBusy(submit, true);
  try {
    await handlers.onLogin(username, password);
    markAuthSuccessAtmosphere();
    if (gateResolve) {
      const resolve = gateResolve;
      gateResolve = null;
      gatePromise = null;
      resolve();
    }
  } catch (error) {
    const message = error?.message || 'Sign in failed';
    setError(
      errorEl,
      /failed to fetch|network error|aborted|timeout/i.test(message)
        ? 'Cannot reach the Weeple API. Is the backend running on port 8000?'
        : message,
    );
  } finally {
    setSubmitBusy(submit, false);
  }
}

async function runRegister(payload, errorEl, submit) {
  setError(errorEl, '');
  if (!handlers?.onRegister) {
    setError(errorEl, 'Still connecting to Weeple… try again in a moment');
    return;
  }
  setSubmitBusy(submit, true);
  try {
    await handlers.onRegister(payload);
    markAuthSuccessAtmosphere();
    if (gateResolve) {
      const resolve = gateResolve;
      gateResolve = null;
      gatePromise = null;
      resolve();
    }
  } catch (error) {
    const message = error?.message || 'Could not create account';
    setError(
      errorEl,
      /failed to fetch|network error|aborted|timeout/i.test(message)
        ? 'Cannot reach the Weeple API. Is the backend running on port 8000?'
        : message,
    );
  } finally {
    setSubmitBusy(submit, false);
  }
}

/** Wire tabs/forms immediately so the gate is usable even if auth API is slow. */
export function initAuthGateUi() {
  const gate = gateEl();
  if (!gate || gate.dataset.wired === '1') return;
  gate.dataset.wired = '1';

  document.getElementById('authTabSignIn')?.addEventListener('click', () => setMode('signin'));
  document.getElementById('authTabCreate')?.addEventListener('click', () => setMode('create'));

  document.getElementById('authFormSignIn')?.addEventListener('submit', (event) => {
    event.preventDefault();
    void runLogin(
      document.getElementById('authSignInUsername')?.value?.trim() || '',
      document.getElementById('authSignInPassword')?.value || '',
      document.getElementById('authSignInError'),
      document.getElementById('authSignInSubmit'),
    );
  });

  document.getElementById('authFormCreate')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const errorEl = document.getElementById('authCreateError');
    const password = document.getElementById('authCreatePassword')?.value || '';
    const confirm = document.getElementById('authCreateConfirm')?.value || '';
    if (password !== confirm) {
      setError(errorEl, 'Passwords do not match');
      return;
    }
    void runRegister(
      {
        username: document.getElementById('authCreateUsername')?.value?.trim() || '',
        password,
        displayName: document.getElementById('authCreateDisplayName')?.value?.trim() || undefined,
      },
      errorEl,
      document.getElementById('authCreateSubmit'),
    );
  });

  updateAuthTabPill('signin');
}

/**
 * Show the gate and resolve when login/register succeeds.
 * @param {{ onLogin: Function, onRegister: Function }} options
 */
export function waitForAuthGate(options = {}) {
  initAuthGateUi();
  handlers = options;
  showAuthGate();

  if (!gatePromise) {
    gatePromise = new Promise((resolve) => {
      gateResolve = resolve;
    });
  }
  return gatePromise;
}

/** Resolve a pending gate wait without a form submit (e.g. stored token valid). */
export function resolveAuthGate() {
  if (gateResolve) {
    const resolve = gateResolve;
    gateResolve = null;
    gatePromise = null;
    resolve();
  }
}

// Wire UI as soon as the module loads (gate is in the initial HTML).
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAuthGateUi();
      if (document.body.classList.contains('auth-pending')) startAuthAtmosphere();
    }, { once: true });
  } else {
    initAuthGateUi();
    if (document.body.classList.contains('auth-pending')) startAuthAtmosphere();
  }
}
