import { ApiError, isApiEnabled } from '../api/client.js';
import { fetchGoals, fetchGoal, patchGoal, createGoal as createGoalApi, deleteGoal as deleteGoalApi } from '../api/goals.js';

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

export async function createGoalOnApi(payload) {
  if (!isApiEnabled()) return null;
  try {
    return await createGoalApi(payload);
  } catch (error) {
    console.warn('[goalsRepository] POST failed', error);
    return null;
  }
}

export async function fetchGoalFromApi(goalId) {
  if (!isApiEnabled() || !goalId) return null;
  try {
    return await fetchGoal(goalId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[goalsRepository] GET goal failed', error);
    return null;
  }
}

export async function deleteGoalOnApi(goalId) {
  if (!isApiEnabled()) return null;
  try {
    return await deleteGoalApi(goalId);
  } catch (error) {
    console.warn('[goalsRepository] DELETE failed', error);
    return null;
  }
}
