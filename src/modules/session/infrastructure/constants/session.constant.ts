export const MANAGER_SESSION_PREFIX = 'mss_';

export const SESSION_LIMITS = Object.freeze({
  ROTATION_GRACE_MS: 30_000,
});

export const MANAGER_SESSION_LIMITS = Object.freeze({
  TOKEN_BYTES: 32,
  IDLE_MS: 30 * 60_000,
  TOUCH_MS: 60_000,
  REFRESH_MARGIN_MS: 60_000,
  CLEANUP_MS: 60 * 60_000,
});
