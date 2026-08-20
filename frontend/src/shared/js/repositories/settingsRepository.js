import { ApiError, isApiEnabled } from '../api/client.js';
import { fetchSettings, patchSettings } from '../api/settings.js';

export async function loadSettingsFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchSettings();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[settingsRepository] GET unavailable', error);
    return null;
  }
}

export async function saveSettingsOnApi(payload) {
  if (!isApiEnabled()) return null;
  try {
    return await patchSettings(payload);
  } catch (error) {
    console.warn('[settingsRepository] PATCH failed', error);
    return null;
  }
}
