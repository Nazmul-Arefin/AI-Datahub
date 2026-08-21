import { api } from './client.js';

export async function login(username, password) {
  return api.post('/auth/token', { username, password });
}

export async function register({ username, password, displayName } = {}) {
  const body = { username, password };
  if (displayName) body.displayName = displayName;
  return api.post('/auth/register', body);
}

export async function fetchMe() {
  return api.get('/auth/me');
}
