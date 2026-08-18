import { api } from './client.js';

export async function fetchOverview() {
  return api.get('/overview');
}

export async function fetchHealth() {
  return api.get('/health');
}
