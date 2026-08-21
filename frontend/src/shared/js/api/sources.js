import { api } from './client.js';

export async function fetchSources(category = 'all') {
  const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const data = await api.get(`/sources${query}`);
  return {
    sources: data.sources || [],
    total: data.total ?? 0,
    assetsProcessedToday: data.assetsProcessedToday ?? 0,
  };
}

export async function patchSource(sourceId, payload) {
  return api.patch(`/sources/${encodeURIComponent(sourceId)}`, payload);
}

export async function disconnectSource(sourceId) {
  return api.post(`/sources/${encodeURIComponent(sourceId)}/disconnect`, {});
}

export async function reconnectSource(sourceId, redirectUri) {
  return api.post(`/sources/${encodeURIComponent(sourceId)}/reconnect`, redirectUri ? { redirectUri } : {});
}

export async function fetchIntegrationCatalog(q = '', category = '') {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category && category !== 'all') params.set('category', category);
  const query = params.toString();
  const data = await api.get(`/integrations/catalog${query ? `?${query}` : ''}`);
  return { items: data.items || [], total: data.total ?? (data.items || []).length };
}

export async function startIntegrationConnect(integrationId, redirectUri) {
  return api.post('/integrations/connect', { integrationId, redirectUri });
}

export async function syncSource(sourceId) {
  return api.post(`/sources/${encodeURIComponent(sourceId)}/sync`, {});
}

export async function fetchSyncedAssets(sourceId, limit = 100) {
  const query = limit ? `?limit=${encodeURIComponent(limit)}` : '';
  return api.get(`/sources/${encodeURIComponent(sourceId)}/synced-assets${query}`);
}
