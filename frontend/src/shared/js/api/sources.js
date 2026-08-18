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

export async function reconnectSource(sourceId) {
  return api.post(`/sources/${encodeURIComponent(sourceId)}/reconnect`, {});
}

export async function fetchIntegrationCatalog() {
  const data = await api.get('/integrations/catalog');
  return data.items || [];
}

export async function startIntegrationConnect(integrationId, redirectUri) {
  return api.post('/integrations/connect', { integrationId, redirectUri });
}
