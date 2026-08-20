import { api } from './client.js';

export async function fetchMemories(q = '') {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  const data = await api.get(`/memories${query}`);
  return data.items || [];
}

export async function fetchMemoryProposals() {
  const data = await api.get('/memories/proposals');
  return data.proposals || [];
}

export async function createMemory(payload) {
  return api.post('/memories', payload);
}

export async function patchMemory(memoryId, payload) {
  return api.patch(`/memories/${encodeURIComponent(memoryId)}`, payload);
}

export async function deleteMemory(memoryId) {
  return api.delete(`/memories/${encodeURIComponent(memoryId)}`);
}
