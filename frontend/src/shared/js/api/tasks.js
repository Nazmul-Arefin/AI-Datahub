import { api } from './client.js';

export async function fetchTasks(goalId = null) {
  const query = goalId ? `?goalId=${encodeURIComponent(goalId)}` : '';
  const data = await api.get(`/tasks${query}`);
  return data.tasks || [];
}

export async function createTask(payload) {
  return api.post('/tasks', payload);
}

export async function patchTask(taskId, payload) {
  return api.patch(`/tasks/${encodeURIComponent(taskId)}`, payload);
}
