import { ApiError, isApiEnabled } from '../api/client.js';
import { startAgentRun, fetchAgentRun, fetchAllowedAgentTools } from '../api/agents.js';

export async function startAgentRunOnApi({ mission, goalId = null } = {}) {
  if (!isApiEnabled()) return null;
  try {
    return await startAgentRun({ mission, goalId });
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[agentsRepository] start run failed', error);
    return null;
  }
}

export async function getAgentRunOnApi(runId) {
  if (!isApiEnabled()) return null;
  try {
    return await fetchAgentRun(runId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[agentsRepository] get run failed', error);
    return null;
  }
}

export async function loadAllowedAgentToolsFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchAllowedAgentTools();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[agentsRepository] tools unavailable', error);
    return null;
  }
}
