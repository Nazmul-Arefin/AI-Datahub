import { ApiError, isApiEnabled } from '../api/client.js';
import {
  fetchMessagingPlatforms,
  fetchMessagingSources,
  connectMessagingPlatform,
  sendMessagingMessage,
} from '../api/messaging.js';

export async function loadMessagingPlatformsFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchMessagingPlatforms();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[messagingRepository] platforms unavailable', error);
    return null;
  }
}

export async function loadMessagingSourcesFromApi() {
  if (!isApiEnabled()) return null;
  try {
    return await fetchMessagingSources();
  } catch (error) {
    if (error instanceof ApiError && error.status === 0) return null;
    console.warn('[messagingRepository] sources unavailable', error);
    return null;
  }
}

export async function connectMessagingPlatformOnApi(platform) {
  if (!isApiEnabled()) return null;
  try {
    return await connectMessagingPlatform(platform);
  } catch (error) {
    console.warn('[messagingRepository] connect failed', error);
    return null;
  }
}

export async function sendMessageOnApi(payload) {
  if (!isApiEnabled()) return null;
  try {
    return await sendMessagingMessage(payload);
  } catch (error) {
    console.warn('[messagingRepository] send failed', error);
    throw error;
  }
}
