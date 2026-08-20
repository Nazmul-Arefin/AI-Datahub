import { api } from './client.js';

export async function fetchMessagingPlatforms() {
  const data = await api.get('/messaging/platforms');
  return data.platforms || [];
}

export async function fetchMessagingSources() {
  const data = await api.get('/messaging/sources');
  return data.sources || [];
}

export async function connectMessagingPlatform(platform) {
  return api.post(`/messaging/${encodeURIComponent(platform)}/connect`);
}

export async function sendMessagingMessage(payload) {
  return api.post('/messaging/messages', payload);
}
