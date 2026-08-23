/**
 * AstrBot platform setup (飞书 / 钉钉 / 企微 / QQ / 个人微信).
 * Embeds the AstrBot platforms page so QR scan stays in Weeple.
 * Polls until the platform is ready, then returns to Import Data.
 */

export function openAstrBotSetup({
  name = 'messaging app',
  setupUrl,
  hint,
  onRetry,
  onCancel,
  pollReady,
  pollIntervalMs = 2500,
  onReady,
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

  const titleWrap = document.createElement('div');
  titleWrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;min-width:0;flex:1;';
  const title = document.createElement('strong');
  title.textContent = `Connect ${name}`;
  title.style.cssText = 'font:700 14px/1.2 system-ui,sans-serif;';
  const subtitle = document.createElement('span');
  subtitle.textContent = hint
    || 'Add this platform in AstrBot (One-click QR when available). After Save, Weeple returns to Import Data automatically.';
  subtitle.style.cssText = 'font:400 12px/1.35 system-ui,sans-serif;color:#94a3b8;';
  const status = document.createElement('span');
  status.style.cssText = 'font:500 11px/1.3 system-ui,sans-serif;color:#38bdf8;';
  status.textContent = 'Waiting for AstrBot Save…';
  titleWrap.append(title, subtitle, status);

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.style.cssText = btnStyle(false);

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.textContent = 'Open in new tab';
  openBtn.style.cssText = btnStyle(false);

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'I’ve set it up';
  retry.style.cssText = btnStyle(true);

  actions.append(cancel, openBtn, retry);
  bar.append(titleWrap, actions);

  const frameWrap = document.createElement('div');
  frameWrap.style.cssText = 'flex:1 1 auto;min-height:0;position:relative;background:#0b0f14;';

  if (setupUrl) {
    const iframe = document.createElement('iframe');
    iframe.title = 'AstrBot platforms';
    iframe.src = setupUrl;
    iframe.allow = 'clipboard-write';
    iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;background:#0b0f14;';
    frameWrap.appendChild(iframe);
  } else {
    const empty = document.createElement('p');
    empty.textContent = 'AstrBot setup URL is missing. Check ASTRBOT_PUBLIC_URL.';
    empty.style.cssText = 'margin:24px;color:#fca5a5;font:14px/1.4 system-ui,sans-serif;';
    frameWrap.appendChild(empty);
  }

  overlay.append(bar, frameWrap);
  document.body.appendChild(overlay);

  let settled = false;
  let pollTimer = null;
  let finishing = false;

  function cleanup() {
    settled = true;
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    overlay.remove();
  }

  async function finishReady(payload) {
    if (finishing || settled) return;
    finishing = true;
    status.textContent = 'Connected — returning to Import Data…';
    status.style.color = '#4ade80';
    retry.disabled = true;
    cancel.disabled = true;
    cleanup();
    if (typeof onReady === 'function') {
      onReady(payload);
      return;
    }
    if (typeof onRetry === 'function') onRetry();
  }

  async function checkReady() {
    if (settled || finishing || typeof pollReady !== 'function') return;
    try {
      const result = await pollReady();
      if (result?.ready) {
        await finishReady(result.payload || result);
      }
    } catch {
      // keep polling; user can still click “I’ve set it up”
    }
  }

  cancel.addEventListener('click', () => {
    cleanup();
    if (typeof onCancel === 'function') onCancel();
  });
  openBtn.addEventListener('click', () => {
    if (setupUrl) window.open(setupUrl, '_blank', 'noopener,noreferrer');
  });
  retry.addEventListener('click', async () => {
    if (finishing) return;
    status.textContent = 'Checking AstrBot…';
    if (typeof pollReady === 'function') {
      try {
        const result = await pollReady();
        if (result?.ready) {
          await finishReady(result.payload || result);
          return;
        }
        status.textContent = 'Still waiting — click Save in AstrBot first, then try again.';
        status.style.color = '#fbbf24';
      } catch {
        status.textContent = 'Check failed — try Save again, then I’ve set it up.';
        status.style.color = '#fbbf24';
      }
      return;
    }
    cleanup();
    if (typeof onRetry === 'function') onRetry();
  });

  if (typeof pollReady === 'function') {
    pollTimer = setInterval(() => {
      void checkReady();
    }, Math.max(1500, Number(pollIntervalMs) || 2500));
    void checkReady();
  }

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
    'white-space:nowrap',
  ].join(';');
}
