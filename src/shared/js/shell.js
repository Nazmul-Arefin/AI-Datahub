const viewRoutes = Object.freeze({
  overview: 'overview',
  goals: 'goals',
  data: 'import-data',
  memory: 'use-memory',
});

export function bindShell(router) {
  document.addEventListener('click', (event) => {
    const home = event.target.closest('[data-home]');
    const view = event.target.closest('[data-view]');
    if (!home && !view) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    router.navigate(home ? 'overview' : viewRoutes[view.dataset.view]);
  }, true);

  document.addEventListener('weeple:routechange', (event) => {
    const route = event.detail;
    document.querySelectorAll('[data-view]').forEach((item) => {
      const active = viewRoutes[item.dataset.view] === route.id;
      item.classList.toggle('active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  });
}
