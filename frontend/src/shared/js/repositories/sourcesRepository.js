import { ApiError, isApiEnabled } from '../api/client.js';
import {
  fetchSources,
  patchSource,
  disconnectSource,
  reconnectSource,
  fetchIntegrationCatalog,
  startIntegrationConnect,
} from '../api/sources.js';

export async function loadSourcesFromApi(category = 'all') {
  if (!isApiEnabled()) return null;
  try {
    return await fetchSources(category);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[sourcesRepository] API unavailable, using mocks', error);
    return null;
  }
}

export async function toggleSourceOnApi(sourceId, aiEnabled) {
  if (!isApiEnabled()) return null;
  return patchSource(sourceId, { aiEnabled });
}

export async function disconnectSourceOnApi(sourceId) {
  if (!isApiEnabled()) return null;
  return disconnectSource(sourceId);
}

export async function reconnectSourceOnApi(sourceId) {
  if (!isApiEnabled()) return null;
  return reconnectSource(sourceId);
}

export async function loadCatalogFromApi(q = '', category = '') {
  if (!isApiEnabled()) return null;
  try {
    return await fetchIntegrationCatalog(q, category);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[sourcesRepository] catalog unavailable', error);
    return null;
  }
}

export async function startConnectOnApi(integrationId, redirectUri) {
  if (!isApiEnabled()) return null;
  return startIntegrationConnect(integrationId, redirectUri);
}
