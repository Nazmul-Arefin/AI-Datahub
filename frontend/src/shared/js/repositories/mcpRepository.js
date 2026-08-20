import { ApiError, isApiEnabled } from '../api/client.js';
import { fetchMcpServers, fetchMcpTools, fetchMcpAudit, invokeMcpTool } from '../api/mcp.js';

export async function loadMcpServersFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchMcpServers();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[mcpRepository] servers unavailable', error);
    return null;
  }
}

export async function loadMcpToolsFromApi(serverId) {
  if (!isApiEnabled()) return null;
  try {
    return await fetchMcpTools(serverId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[mcpRepository] tools unavailable', error);
    return null;
  }
}

export async function loadMcpAuditFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchMcpAudit();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[mcpRepository] audit unavailable', error);
    return null;
  }
}

export async function invokeMcpToolOnApi(payload) {
  if (!isApiEnabled()) return null;
  try {
    return await invokeMcpTool(payload);
  } catch (error) {
    console.warn('[mcpRepository] invoke failed', error);
    throw error;
  }
}
