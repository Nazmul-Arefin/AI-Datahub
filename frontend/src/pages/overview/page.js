import { activatePage, deactivatePage } from '../../shared/js/app-runtime.js';

/**
 * Overview page — topology canvas + calendar.
 * Shared engine lives in app-runtime; this module owns mount lifecycle for #/overview.
 */
let mounted = false;
let unsubscribeGoals = null;
let unsubscribeCalendar = null;

export function mount({ store, params }) {
  activatePage('overview', params);
  // Re-sync calendar when goals change on another page
  unsubscribeGoals = store.subscribe('goals:changed', () => {
    try {
      window.dispatchEvent(new CustomEvent('weeple:goals-changed'));
    } catch (_) { /* optional */ }
  });
  unsubscribeCalendar = store.subscribe('calendar:changed', () => {
    try {
      window.dispatchEvent(new CustomEvent('weeple:calendar-changed'));
    } catch (_) { /* optional */ }
  });
  mounted = true;
}

export function unmount() {
  if (!mounted) return;
  unsubscribeGoals?.();
  unsubscribeCalendar?.();
  unsubscribeGoals = null;
  unsubscribeCalendar = null;
  deactivatePage('overview');
  mounted = false;
}
