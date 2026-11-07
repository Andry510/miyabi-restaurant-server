export const SOCKET_EVENT = Object.freeze({
  NOTIFICATION_CREATED: 'notification.created',
  CLOUD_NOTIFICATION: 'cloud.notification',
  SESSION_EXPIRED: 'session.expired',
} as const);

export const SOCKET_CHANNEL = Object.freeze({
  EMPLOYEE: (userId: string): string => `employee:${userId}`,
  MANAGERS: 'managers',
  MANAGER: (cloudUserId: string): string => `manager:${cloudUserId}`,
});

export const SOCKET_HANDSHAKE_KEY = Object.freeze({
  ACCESS_TOKEN: 'access_token',
  AUDIENCE: 'audience',
} as const);

export const SOCKET_AUDIENCE = Object.freeze({
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
} as const);

export const SOCKET_LIMITS = Object.freeze({
  REVALIDATE_MS: 60_000,
  MAX_FRAME_BYTES: 64 * 1024,
});
