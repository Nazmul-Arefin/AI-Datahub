import { ApiError, isApiEnabled } from '../api/client.js';
import {
  fetchMemories,
  fetchMemoryProposals,
  createMemory,
  patchMemory,
  deleteMemory,
} from '../api/memories.js';

export async function loadMemoriesFromApi(q = '') {
  if (!isApiEnabled()) return null;
  try {
    return await fetchMemories(q);
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[memoriesRepository] API unavailable, using mocks', error);
    return null;
  }
}

export async function loadMemoryProposalsFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchMemoryProposals();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[memoriesRepository] proposals unavailable', error);
    return null;
  }
}

export async function createMemoryOnApi(payload) {
  if (!isApiEnabled()) return null;
  try {
    return await createMemory(payload);
  } catch (error) {
    console.warn('[memoriesRepository] POST failed', error);
    return null;
  }
}

export async function updateMemoryOnApi(memoryId, payload) {
  if (!isApiEnabled()) return null;
  try {
    return await patchMemory(memoryId, payload);
  } catch (error) {
    console.warn('[memoriesRepository] PATCH failed', error);
    throw error;
  }
}

export async function deleteMemoryOnApi(memoryId) {
  if (!isApiEnabled()) return null;
  try {
    return await deleteMemory(memoryId);
  } catch (error) {
    console.warn('[memoriesRepository] DELETE failed', error);
    throw error;
  }
}
