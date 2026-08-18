import { DEFAULT_ROUTE, ROUTES, parseHash } from './routes.js';

/**
 * Hash router with keep-alive page roots.
 * All page views are loaded once so the adapted monolith can bind listeners.
 * activate/deactivate (mount/unmount) run on every route change.
 */
export function createRouter({ outlet, store, showToast, onRouteChange, runtime }) {
  let ready = false;
  let currentId = null;
  const modules = {};

  function navigate(routeId, { replace = false, params = null } = {}) {
    const route = ROUTES[routeId] || ROUTES[DEFAULT_ROUTE];
    let hash = route.path;
    if (params && [...params.keys()].length) hash += `?${params.toString()}`;
    if (replace) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`);
      void applyRoute();
    } else if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      void applyRoute();
    }
  }

  async function preloadPages() {
    if (ready) return;
    outlet.innerHTML = '';

    await Promise.all(Object.values(ROUTES).map(async (route) => {
      // Page CSS
      if (!document.querySelector(`link[data-page-css="${route.id}"]`)) {
        const cssEl = document.createElement('link');
        cssEl.rel = 'stylesheet';
        cssEl.href = route.cssUrl;
        cssEl.dataset.pageCss = route.id;
        document.head.appendChild(cssEl);
      }

      const html = await fetch(route.viewUrl).then((r) => {
        if (!r.ok) throw new Error(`Failed to load ${route.viewUrl}`);
        return r.text();
      });

      const root = document.createElement('div');
      root.className = `page page--${route.id}`;
      root.dataset.page = route.id;
      root.hidden = true;
      root.style.display = 'none';
      root.innerHTML = html;
      outlet.appendChild(root);

      const mod = await import(/* webpackIgnore: true */ route.moduleUrl);
      modules[route.id] = { mod, root, route };
    }));

    runtime.configureRuntime({ navigate, showToast, store });
    runtime.ensureBootstrapped();
    ready = true;
  }

  async function applyRoute() {
    await preloadPages();
    const { id, params } = parseHash(window.location.hash);
    const route = ROUTES[id] || ROUTES[DEFAULT_ROUTE];

    if (currentId && currentId !== route.id && modules[currentId]?.mod?.unmount) {
      try { modules[currentId].mod.unmount(); } catch (error) { console.error(error); }
    }

    currentId = route.id;

    if (modules[route.id]?.mod?.mount) {
      await modules[route.id].mod.mount({
        root: modules[route.id].root,
        store,
        navigate,
        showToast,
        params,
        route,
      });
    }

    onRouteChange?.(route, params);
  }

  function start() {
    window.addEventListener('hashchange', () => { void applyRoute(); });

    if (!window.location.hash || window.location.hash === '#') {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}#/${DEFAULT_ROUTE}`
      );
    } else if (!window.location.hash.startsWith('#/')) {
      const { id, params } = parseHash(window.location.hash);
      const route = ROUTES[id] || ROUTES[DEFAULT_ROUTE];
      const next = route.path + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
    }

    return applyRoute();
  }

  return { navigate, start };
}
