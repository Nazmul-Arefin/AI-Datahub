/** Safe localStorage helpers. Keys stay byte-compatible with the monolith. */
const KEYS = {
  topologyHintSeen: 'weeple-topology-hint-seen',
  goalHintSeen: 'weeple-goal-hint-seen',
  useGoalStringHidden: 'weeple-use-goal-string-hidden',
  deletedGoals: 'weeple-deleted-goals',
  pausedMonitoring: 'weeple-paused-goal-monitoring',
  customGoals: 'weeple-custom-goals',
  planOverrides: 'weeple-goal-plan-overrides',
  planSchema: 'weeple-goal-plan-schema',
  calendarTasks: 'weeple-calendar-tasks',
};

export { KEYS };

export function storageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value == null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function storageGetJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function storageSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
