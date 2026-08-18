import { KEYS, storageGet, storageGetJSON, storageSet, storageSetJSON } from './storage.js';

const listeners = new Map();

function emit(event, detail) {
  const set = listeners.get(event);
  if (!set) return;
  for (const fn of set) {
    try { fn(detail); } catch (error) { console.error(error); }
  }
}

export function subscribe(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event)?.delete(fn);
}

/** Shared cross-page state for goals + calendar tasks. */
export function createStore() {
  const store = {
    goalProfiles: [],
    calendarUserTasks: [],
    deletedGoalTitles: new Set(),
    pausedMonitoringGoalTitles: new Set(),
    planOverrides: {},

    hydrateGoals({ goalProfiles, deletedGoalTitles, pausedMonitoringGoalTitles, planOverrides }) {
      this.goalProfiles = goalProfiles;
      this.deletedGoalTitles = deletedGoalTitles;
      this.pausedMonitoringGoalTitles = pausedMonitoringGoalTitles;
      this.planOverrides = planOverrides || {};
    },

    getGoals() {
      return this.goalProfiles;
    },

    setGoals(goals, { persist = true, emitEvent = true } = {}) {
      this.goalProfiles = goals;
      if (persist) this.persistGoals();
      if (emitEvent) emit('goals:changed', { goals: this.goalProfiles });
    },

    notifyGoalsChanged() {
      this.persistGoals();
      emit('goals:changed', { goals: this.goalProfiles });
    },

    persistGoals() {
      storageSetJSON(KEYS.customGoals, this.goalProfiles.filter((goal) => goal.custom));
      storageSetJSON(KEYS.deletedGoals, [...this.deletedGoalTitles]);
      storageSetJSON(KEYS.pausedMonitoring, [...this.pausedMonitoringGoalTitles]);
      storageSetJSON(KEYS.planOverrides, this.planOverrides);
    },

    hydrateCalendar(tasks) {
      this.calendarUserTasks = Array.isArray(tasks) ? tasks : [];
    },

    getCalendarTasks() {
      return this.calendarUserTasks;
    },

    setCalendarTasks(tasks, { persist = true, emitEvent = true } = {}) {
      this.calendarUserTasks = tasks;
      if (persist) storageSetJSON(KEYS.calendarTasks, this.calendarUserTasks);
      if (emitEvent) emit('calendar:changed', { tasks: this.calendarUserTasks });
    },

    notifyCalendarChanged() {
      storageSetJSON(KEYS.calendarTasks, this.calendarUserTasks);
      emit('calendar:changed', { tasks: this.calendarUserTasks });
    },

    loadHints() {
      return {
        topologyHintSeen: storageGet(KEYS.topologyHintSeen) === '1',
        goalHintSeen: storageGet(KEYS.goalHintSeen) === '1',
        useGoalStringHidden: storageGet(KEYS.useGoalStringHidden) === '1',
      };
    },

    setTopologyHintSeen() {
      storageSet(KEYS.topologyHintSeen, '1');
    },

    setGoalHintSeen() {
      storageSet(KEYS.goalHintSeen, '1');
    },

    setUseGoalStringHidden(hidden) {
      storageSet(KEYS.useGoalStringHidden, hidden ? '1' : '0');
    },

    loadPersistedGoalMeta() {
      return {
        deleted: storageGetJSON(KEYS.deletedGoals, []),
        paused: storageGetJSON(KEYS.pausedMonitoring, []),
        custom: storageGetJSON(KEYS.customGoals, []),
        planOverrides: storageGetJSON(KEYS.planOverrides, {}),
        planSchema: storageGet(KEYS.planSchema),
        calendarTasks: storageGetJSON(KEYS.calendarTasks, []),
      };
    },

    markPlanSchema(version = '2') {
      storageSet(KEYS.planSchema, version);
    },

    subscribe,
    emit,
  };

  return store;
}
