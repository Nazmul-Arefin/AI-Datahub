import { ApiError, isApiEnabled } from '../api/client.js';
import { fetchOverview } from '../api/overview.js';

export async function loadOverviewFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchOverview();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[overviewRepository] API unavailable, using mocks', error);
    return null;
  }
}
