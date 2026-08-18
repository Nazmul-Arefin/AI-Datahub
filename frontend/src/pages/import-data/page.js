import { activatePage, deactivatePage } from '../../shared/js/app-runtime.js';

/**
 * Import Data page — sources grid, inspector, connection wizard.
 */
let mounted = false;

export function mount({ params }) {
  activatePage('import-data', params);
  mounted = true;
}

export function unmount() {
  if (!mounted) return;
  deactivatePage('import-data');
  mounted = false;
}
