import { ApiError, fetchSources, patchSource, disconnectSource, reconnectSource } from '../api/sources.js';
import { isApiEnabled } from '../api/client.js';

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
