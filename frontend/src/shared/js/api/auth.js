import { api } from './client.js';

export async function login(username, password) {
  return api.post('/auth/token', { username, password });
}

export async function fetchMe() {
  return api.get('/auth/me');
}
