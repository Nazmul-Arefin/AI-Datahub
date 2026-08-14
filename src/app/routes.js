export const routes = Object.freeze([
  {
    id: 'overview',
    label: 'Overview',
    legacyKey: 'overview',
    view: '../pages/overview/view.html',
    module: '../pages/overview/page.js',
    style: '../pages/overview/page.css',
    fragments: ['overview-primary', 'overview-overlay'],
  },
  {
    id: 'goals',
    label: 'Goals',
    legacyKey: 'goals',
    view: '../pages/goals/view.html',
    module: '../pages/goals/page.js',
    style: '../pages/goals/page.css',
    fragments: ['goals'],
  },
  {
    id: 'import-data',
    label: 'Import Data',
    legacyKey: 'data',
    view: '../pages/import-data/view.html',
    module: '../pages/import-data/page.js',
    style: '../pages/import-data/page.css',
    fragments: ['import-data'],
  },
  {
    id: 'use-memory',
    label: 'Use Memory',
    legacyKey: 'memory',
    view: '../pages/use-memory/view.html',
    module: '../pages/use-memory/page.js',
    style: '../pages/use-memory/page.css',
    fragments: ['use-memory'],
  },
]);

export const routeById = new Map(routes.map((route) => [route.id, route]));
export const routeByLegacyKey = new Map(routes.map((route) => [route.legacyKey, route]));

export function routeFromHash(hash = window.location.hash) {
  const id = hash.replace(/^#\/?/, '').split(/[?&]/, 1)[0];
  return routeById.get(id) || routeById.get('overview');
}
