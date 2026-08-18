import { activatePage, deactivatePage } from '../../shared/js/app-runtime.js';

/**
 * Use Data page — mission workspace, assistant, memory drawer.
 * Teammate-owned folder for ongoing feature work.
 */
let mounted = false;

export function mount({ params }) {
  activatePage('use-data', params);
  mounted = true;
}

export function unmount() {
  if (!mounted) return;
  deactivatePage('use-data');
  mounted = false;
}
