/**
 * AstrBot one-time platform setup (飞书 / 钉钉 / 企微 / QQ).
 * Opens a guided overlay instead of navigating away from Import Data.
 */

export function openAstrBotSetup({
  name = 'messaging app',
  setupUrl,
  hint,
  onRetry,
  onCancel,
} = {}) {
  const existing = document.getElementById('astrbot-setup-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'astrbot-setup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', `Connect ${name}`);
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:100000',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'padding:24px',
    'background:rgba(8,12,18,.72)',
    'backdrop-filter:blur(6px)',
  ].join(';');

  const card = document.createElement('div');
  card.style.cssText = [
    'width:min(440px,100%)',
    'border-radius:16px',
    'padding:22px 22px 18px',
    'background:#111827',
    'color:#e5e7eb',
    'box-shadow:0 24px 64px rgba(0,0,0,.45)',
    'font:14px/1.45 system-ui,sans-serif',
  ].join(';');

  const title = document.createElement('h2');
  title.textContent = `Connect ${name}`;
  title.style.cssText = 'margin:0 0 8px;font:700 18px/1.25 system-ui,sans-serif;';

  const body = document.createElement('p');
  body.textContent = hint
    || 'Open the messaging platforms page → add this app (One-click QR when available), then come back and Connect again.';
  body.style.cssText = 'margin:0 0 16px;color:#cbd5e1;';

  const steps = document.createElement('ol');
  steps.style.cssText = 'margin:0 0 18px;padding-left:18px;color:#94a3b8;';
  [
    'Open the platforms page (button below). Log in if asked.',
    'Add / create the platform for this app (QR when available).',
    'Return here and click “I’ve set it up”.',
  ].forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    li.style.marginBottom = '6px';
    steps.appendChild(li);
  });

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.style.cssText = btnStyle(false);

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.textContent = 'Open setup page';
  openBtn.style.cssText = btnStyle(true);

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'I’ve set it up';
  retry.style.cssText = btnStyle(true);

  function cleanup() {
    overlay.remove();
  }

  cancel.addEventListener('click', () => {
    cleanup();
    if (typeof onCancel === 'function') onCancel();
  });
  openBtn.addEventListener('click', () => {
    if (setupUrl) window.open(setupUrl, '_blank', 'noopener,noreferrer');
  });
  retry.addEventListener('click', () => {
    cleanup();
    if (typeof onRetry === 'function') onRetry();
  });

  actions.append(cancel, openBtn, retry);
  card.append(title, body, steps, actions);
  overlay.appendChild(card);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      cleanup();
      if (typeof onCancel === 'function') onCancel();
    }
  });
  document.body.appendChild(overlay);
  return cleanup;
}

function btnStyle(primary) {
  return [
    'border:1px solid rgba(255,255,255,.18)',
    'border-radius:10px',
    'padding:8px 14px',
    primary ? 'background:#2563eb' : 'background:transparent',
    'color:#e5e7eb',
    'cursor:pointer',
    'font:600 12px/1 system-ui,sans-serif',
  ].join(';');
}
