/**
 * Living topology + status ticker for the auth gate atmosphere.
 */

const STATUS_LINES = [
  'Personal graph idle',
  'Waiting for identity',
  'Mapping local context',
  'Ready to boot',
];

const MAX_NODES = 48;
const LINK_DISTANCE = 140;

let running = false;
let rafId = 0;
let tickerId = 0;
let statusIndex = 0;
let nodes = [];
let width = 0;
let height = 0;
let pointerX = 0.5;
let pointerY = 0.5;
let dpr = 1;

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

function canvasEl() {
  return document.getElementById('authTopology');
}

function meshEl() {
  return document.querySelector('#authGate .auth-gate-mesh');
}

function resizeCanvas() {
  const canvas = canvasEl();
  if (!canvas) return;
  const rect = canvas.parentElement?.getBoundingClientRect() || {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  width = Math.max(1, Math.floor(rect.width));
  height = Math.max(1, Math.floor(rect.height));
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function seedNodes() {
  const count = Math.min(MAX_NODES, Math.floor((width * height) / 28000) + 18);
  nodes = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const radius = 0.18 + Math.random() * 0.42;
    return {
      x: width * (0.5 + Math.cos(angle) * radius * (0.55 + Math.random() * 0.45)),
      y: height * (0.48 + Math.sin(angle) * radius * (0.5 + Math.random() * 0.45)),
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: 1.4 + Math.random() * 2.4,
      pulse: Math.random() * Math.PI * 2,
      hub: i % 7 === 0,
    };
  });
}

function drawFrame(time) {
  const canvas = canvasEl();
  if (!canvas || !running) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  const t = time * 0.001;
  for (const node of nodes) {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 24 || node.x > width - 24) node.vx *= -1;
    if (node.y < 24 || node.y > height - 24) node.vy *= -1;
    node.x += Math.sin(t + node.pulse) * 0.08;
    node.y += Math.cos(t * 0.9 + node.pulse) * 0.08;
  }

  // Links
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist > LINK_DISTANCE) continue;
      const alpha = (1 - dist / LINK_DISTANCE) * 0.28;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(255, 94, 0, ${alpha})`;
      ctx.lineWidth = a.hub || b.hub ? 1.15 : 0.7;
      if ((i + j) % 3 === 0) ctx.setLineDash([3, 6]);
      else ctx.setLineDash([]);
      ctx.lineDashOffset = -t * 18;
      ctx.stroke();
    }
  }
  ctx.setLineDash([]);

  // Nodes
  for (const node of nodes) {
    const glow = 0.45 + Math.sin(t * 2 + node.pulse) * 0.2;
    if (node.hub) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r * 4.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 94, 0, ${0.08 * glow})`;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fillStyle = node.hub
      ? `rgba(255, 94, 0, ${0.85 * glow})`
      : `rgba(26, 26, 24, ${0.28 + glow * 0.2})`;
    ctx.fill();
  }

  rafId = window.requestAnimationFrame(drawFrame);
}

function onPointerMove(event) {
  if (prefersReducedMotion() || !running) return;
  const mesh = meshEl();
  if (!mesh) return;
  pointerX = event.clientX / window.innerWidth;
  pointerY = event.clientY / window.innerHeight;
  const x = (pointerX - 0.5) * 18;
  const y = (pointerY - 0.5) * 14;
  mesh.style.setProperty('--auth-parallax-x', `${x.toFixed(2)}px`);
  mesh.style.setProperty('--auth-parallax-y', `${y.toFixed(2)}px`);
}

function setStatusText(text) {
  const el = document.getElementById('authStatusText');
  if (el) el.textContent = text;
}

function startTicker() {
  stopTicker();
  if (prefersReducedMotion()) {
    setStatusText('Ready to boot');
    return;
  }
  setStatusText(STATUS_LINES[statusIndex]);
  tickerId = window.setInterval(() => {
    statusIndex = (statusIndex + 1) % STATUS_LINES.length;
    setStatusText(STATUS_LINES[statusIndex]);
  }, 3500);
}

function stopTicker() {
  if (tickerId) {
    window.clearInterval(tickerId);
    tickerId = 0;
  }
}

function onVisibility() {
  if (document.hidden) {
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
    return;
  }
  if (running && !prefersReducedMotion() && !rafId) {
    rafId = window.requestAnimationFrame(drawFrame);
  }
}

function onResize() {
  if (!running) return;
  resizeCanvas();
  seedNodes();
}

export function startAuthAtmosphere() {
  if (running) return;
  running = true;
  resizeCanvas();
  seedNodes();
  startTicker();

  if (!prefersReducedMotion()) {
    rafId = window.requestAnimationFrame(drawFrame);
  } else {
    // Draw one static frame for atmosphere without motion.
    const canvas = canvasEl();
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fillStyle = node.hub ? 'rgba(255, 94, 0, 0.55)' : 'rgba(26, 26, 24, 0.28)';
        ctx.fill();
      }
    }
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
}

export function stopAuthAtmosphere() {
  running = false;
  stopTicker();
  if (rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('resize', onResize);
  document.removeEventListener('visibilitychange', onVisibility);
  const mesh = meshEl();
  mesh?.style.setProperty('--auth-parallax-x', '0px');
  mesh?.style.setProperty('--auth-parallax-y', '0px');
}

export function markAuthSuccessAtmosphere() {
  gateEl()?.classList.add('is-authenticated');
  setStatusText('Identity confirmed — booting OS');
}

function gateEl() {
  return document.getElementById('authGate');
}

export function updateAuthTabPill(mode) {
  const tabs = document.querySelector('#authGate .auth-tabs');
  if (tabs) tabs.dataset.mode = mode === 'create' ? 'create' : 'signin';
}

export function setSubmitBusy(submit, busy) {
  if (!submit) return;
  submit.classList.toggle('is-busy', Boolean(busy));
  submit.disabled = Boolean(busy);
}
