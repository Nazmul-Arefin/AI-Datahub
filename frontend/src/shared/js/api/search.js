import { api } from './client.js';

export async function searchPlatform(q, { limit = 20 } = {}) {
  const params = new URLSearchParams();
  params.set('q', q || '');
  if (limit) params.set('limit', String(limit));
  return api.get(`/search?${params.toString()}`);
}
