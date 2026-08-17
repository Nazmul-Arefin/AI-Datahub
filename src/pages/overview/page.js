let context = null;

export function mount(nextContext) {
  context = nextContext;
  window.WeepleLegacy?.openPrimaryView('overview', nextContext.announce);
  window.dispatchEvent(new CustomEvent('weeple:page-mounted', { detail: { page: 'overview' } }));
}
export function unmount() {
  window.WeepleLegacy?.unmountPage('overview');
  context = null;
}
