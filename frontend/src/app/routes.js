/** Route registry — defined once so page work does not edit this file routinely. */

export const ROUTES = {
  overview: {
    id: 'overview',
    path: '#/overview',
    title: 'Overview',
    shellClass: null,
    viewUrl: new URL('../pages/overview/view.html', import.meta.url).href,
    cssUrl: new URL('../pages/overview/page.css', import.meta.url).href,
    moduleUrl: new URL('../pages/overview/page.js', import.meta.url).href,
  },
  goals: {
    id: 'goals',
    path: '#/goals',
    title: 'Goals',
    shellClass: 'goals-page',
    viewUrl: new URL('../pages/goals/view.html', import.meta.url).href,
    cssUrl: new URL('../pages/goals/page.css', import.meta.url).href,
    moduleUrl: new URL('../pages/goals/page.js', import.meta.url).href,
  },
  'import-data': {
    id: 'import-data',
    path: '#/import-data',
    title: 'Import Data',
    shellClass: 'data-page',
    viewUrl: new URL('../pages/import-data/view.html', import.meta.url).href,
    cssUrl: new URL('../pages/import-data/page.css', import.meta.url).href,
    moduleUrl: new URL('../pages/import-data/page.js', import.meta.url).href,
  },
  'use-data': {
    id: 'use-data',
    path: '#/use-data',
    title: 'Use Data',
    shellClass: 'use-page',
    viewUrl: new URL('../pages/use-data/view.html', import.meta.url).href,
    cssUrl: new URL('../pages/use-data/page.css', import.meta.url).href,
    moduleUrl: new URL('../pages/use-data/page.js', import.meta.url).href,
  },
};

export const DEFAULT_ROUTE = 'overview';

/** Map legacy monolith hashes / activity targets to route ids. */
export const LEGACY_HASH_MAP = {
  '': DEFAULT_ROUTE,
  overview: 'overview',
  goals: 'goals',
  data: 'import-data',
  memory: 'use-data',
  'import-data': 'import-data',
  'use-data': 'use-data',
  setup: 'overview',
  'new-goal': 'goals',
  'goal-plan': 'goals',
  'connect-source': 'import-data',
  'memory-manager': 'use-data',
  calendar: 'overview',
};

export function parseHash(hash = window.location.hash) {
  const raw = (hash || '').replace(/^#\/?/, '').trim();
  const [pathPart, queryPart] = raw.split('?');
  const legacy = LEGACY_HASH_MAP[pathPart] || (ROUTES[pathPart] ? pathPart : null);
  const params = new URLSearchParams(queryPart || '');
  if (pathPart === 'setup') params.set('onboarding', '1');
  if (pathPart === 'new-goal') params.set('sheet', 'create');
  if (pathPart === 'goal-plan') params.set('drawer', 'plan');
  if (pathPart === 'connect-source') params.set('wizard', '1');
  if (pathPart === 'memory-manager') params.set('memory', '1');
  return {
    id: legacy || DEFAULT_ROUTE,
    params,
    legacyPath: pathPart,
  };
}
