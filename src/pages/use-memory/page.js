let context = null;

export function mount(nextContext) {
  context = nextContext;
  window.WeepleLegacy?.openPrimaryView('memory', nextContext.announce);
  window.dispatchEvent(new CustomEvent('weeple:page-mounted', { detail: { page: 'use-memory' } }));
}
export function unmount() {
  window.WeepleLegacy?.unmountPage('memory');
  context = null;
}
