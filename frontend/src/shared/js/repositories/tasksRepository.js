import { ApiError, isApiEnabled } from '../api/client.js';
import { fetchTasks, patchTask, createTask } from '../api/tasks.js';

export async function loadTasksFromApi(goalId = null) {
  if (!isApiEnabled()) return null;
  try {
    return await fetchTasks(goalId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[tasksRepository] API unavailable', error);
    return null;
  }
}

export async function createTaskOnApi(payload) {
  if (!isApiEnabled()) return null;
  try {
    return await createTask(payload);
  } catch (error) {
    console.warn('[tasksRepository] POST failed', error);
    throw error;
  }
}

export async function updateTaskOnApi(taskId, payload) {
  if (!isApiEnabled()) return null;
  try {
    return await patchTask(taskId, payload);
  } catch (error) {
    console.warn('[tasksRepository] PATCH failed', error);
    throw error;
  }
}
