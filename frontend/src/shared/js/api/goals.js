import { api } from './client.js';

export async function fetchGoals() {
  const data = await api.get('/goals');
  return data.goals || [];
}

export async function fetchGoal(goalId) {
  return api.get(`/goals/${encodeURIComponent(goalId)}`);
}

export async function patchGoal(goalId, payload) {
  return api.patch(`/goals/${encodeURIComponent(goalId)}`, payload);
}
