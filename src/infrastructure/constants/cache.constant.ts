export const CACHE_KEY = Object.freeze({
  SETTINGS: 'settings',
  MANAGER_SESSION: (tokenHash: string) => `manager-session:${tokenHash}`,
  MANAGER_SESSION_GROUP: (sessionKey: string) =>
    `manager-session-group:${sessionKey}`,
});

export const CACHE_TTL_SECONDS = Object.freeze({
  SETTINGS: 86_400,
});
