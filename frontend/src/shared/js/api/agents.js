import { api } from './client.js';

export async function startAgentRun({ mission, goalId = null } = {}) {
  return api.post('/agents/runs', {
    mission,
    ...(goalId ? { goalId } : {}),
  });
}

export async function fetchAgentRun(runId) {
  return api.get(`/agents/runs/${encodeURIComponent(runId)}`);
}

export async function fetchAllowedAgentTools() {
  const data = await api.get('/agents/tools');
  return data.tools || [];
}
