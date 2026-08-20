import { api } from './client.js';

export async function fetchSettings() {
  return api.get('/settings');
}

export async function patchSettings(payload) {
  return api.patch('/settings', payload);
}
