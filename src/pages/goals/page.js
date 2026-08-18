import { activatePage, deactivatePage } from '../../shared/js/app-runtime.js';

/**
 * Goals page — goal profiles, plan editor, persistence via shared store events.
 */
let mounted = false;

export function mount({ params }) {
  activatePage('goals', params);
  mounted = true;
}

export function unmount() {
  if (!mounted) return;
  deactivatePage('goals');
  mounted = false;
}
