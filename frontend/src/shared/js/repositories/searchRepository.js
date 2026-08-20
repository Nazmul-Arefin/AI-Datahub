import { ApiError, isApiEnabled } from '../api/client.js';
import { searchPlatform } from '../api/search.js';

export async function searchPlatformFromApi(q, options = {}) {
  if (!isApiEnabled()) return null;
  try {
    return await searchPlatform(q, options);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[searchRepository] search unavailable', error);
    return null;
  }
}
