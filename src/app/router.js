import { routeById, routeByLegacyKey, routeFromHash, routes } from './routes.js';

const fragmentOrder = [
  'overview-primary',
  'goals',
  'import-data',
  'use-memory',
  'overview-overlay',
];

async function fetchPageFragments(route) {
  const response = await fetch(new URL(route.view, import.meta.url));
  if (!response.ok) throw new Error(`Unable to load ${route.label} (${response.status})`);

  const fragmentDocument = document.createElement('div');
  fragmentDocument.innerHTML = await response.text();
  return route.fragments.map((name) => {
    const template = fragmentDocument.querySelector(`template[data-page-fragment="${name}"]`);
    if (!template) throw new Error(`The ${route.label} view is missing fragment "${name}".`);
    return [name, template.content];
  });
}

export function createRouter({ outlet, store, showToast }) {
  let activeRoute = null;
  let activePage = null;
  let started = false;

  async function loadViews() {
    outlet.dataset.loading = 'true';
    const entries = await Promise.all(routes.map(fetchPageFragments));
    const fragments = new Map(entries.flat());
    const assembled = document.createDocumentFragment();
    fragmentOrder.forEach((name) => assembled.append(fragments.get(name).cloneNode(true)));
    outlet.replaceChildren(assembled);
    delete outlet.dataset.loading;
  }

  function ensureStyle(route) {
    const id = `page-style-${route.id}`;
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = new URL(route.style, import.meta.url).href;
    document.head.append(link);
  }

  async function applyRoute(route = routeFromHash()) {
    if (activeRoute?.id === route.id && activePage) return;
    await activePage?.unmount?.();
    ensureStyle(route);
    const page = await import(new URL(route.module, import.meta.url).href);
    outlet.dataset.page = route.id;
    document.body.dataset.page = route.id;
    await page.mount({ outlet, store, navigate, showToast });
    activeRoute = route;
    activePage = page;
    document.dispatchEvent(new CustomEvent('weeple:routechange', { detail: route }));
  }

  function navigate(id, { replace = false } = {}) {
    const route = routeById.get(id) || routeById.get('overview');
    const nextHash = `#/${route.id}`;
    if (window.location.hash === nextHash) {
      void applyRoute(route);
      return;
    }
    if (replace) window.location.replace(nextHash);
    else window.location.hash = nextHash;
  }

  function navigateByLegacyKey(key) {
    navigate(routeByLegacyKey.get(key)?.id || 'overview');
  }

  function start() {
    if (started) return;
    started = true;
    window.addEventListener('hashchange', () => void applyRoute());
    const route = routeFromHash();
    if (!window.location.hash.startsWith('#/')) navigate(route.id, { replace: true });
    else void applyRoute(route);
  }

  return Object.freeze({ loadViews, navigate, navigateByLegacyKey, start });
}
