import { api } from './client.js';

export async function fetchMcpServers() {
  const data = await api.get('/mcp/servers');
  return data.servers || [];
}

export async function fetchMcpTools(serverId) {
  const data = await api.get(`/mcp/servers/${encodeURIComponent(serverId)}/tools`);
  return data.tools || [];
}

export async function fetchMcpAudit() {
  const data = await api.get('/mcp/audit');
  return data;
}

export async function invokeMcpTool(payload) {
  return api.post('/mcp/invoke', payload);
}
