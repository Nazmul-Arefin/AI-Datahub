import { ApiError, isApiEnabled } from '../api/client.js';
import { fetchGoals, patchGoal } from '../api/goals.js';

/**
 * Goals data access — uses API when configured, otherwise returns null
 * so callers can keep using in-memory mocks.
 */
export async function loadGoalsFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchGoals();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[goalsRepository] API unavailable, using mocks', error);
    return null;
  }
}

export async function updateGoalOnApi(goalId, payload) {
  if (!isApiEnabled()) return null;
  try {
    return await patchGoal(goalId, payload);
  } catch (error) {
    console.warn('[goalsRepository] PATCH failed', error);
    throw error;
  }
}
