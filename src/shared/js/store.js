import { readStorage, writeStorage } from './storage.js';

const keys = Object.freeze({
  customGoals: 'weeple-custom-goals',
  goalPlanOverrides: 'weeple-goal-plan-overrides',
  deletedGoals: 'weeple-deleted-goals',
  pausedGoalMonitoring: 'weeple-paused-goal-monitoring',
  calendarTasks: 'weeple-calendar-tasks',
});

export function createStore() {
  const events = new EventTarget();

  function read(name, fallback) {
    if (!keys[name]) throw new Error(`Unknown store key: ${name}`);
    return readStorage(keys[name], fallback);
  }

  function write(name, value) {
    if (!keys[name]) throw new Error(`Unknown store key: ${name}`);
    const persisted = writeStorage(keys[name], value);
    events.dispatchEvent(new CustomEvent(`${name}:changed`, { detail: { value, persisted } }));
    return persisted;
  }

  function subscribe(name, listener, options) {
    const eventName = `${name}:changed`;
    events.addEventListener(eventName, listener, options);
    return () => events.removeEventListener(eventName, listener, options);
  }

  return Object.freeze({ keys, read, write, subscribe });
}
