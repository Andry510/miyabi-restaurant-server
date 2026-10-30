export const CHANNEL_EVENT = Object.freeze({
  SYNC_REQUIRED: 'sync_required',
  PRODUCT: 'product',
  PRODUCT_REMOVED: 'product_removed',
  TRANSFER: 'transfer',
  SESSION_REVOKED: 'session_revoked',
  SESSION_EXPIRED: 'session_expired',
} as const);

export const CHANNEL_REQUEST = Object.freeze({
  ATTENDANCE: 'attendance_request',
} as const);

export const CHANNEL_FATAL_REASONS: readonly string[] = Object.freeze([
  'ERROR_SERVER_DISABLED',
  'ERROR_SERVER_REVOKED',
  'ERROR_SERVER_TOKEN_REGENERATED',
  'ERROR_SERVER_CHANNEL_REPLACED',
  'ERROR_INVALID_SERVER_TOKEN',
]);

export const CHANNEL_LIMITS = Object.freeze({
  RETRY_MIN_MS: 1_000,
  RETRY_MAX_MS: 30_000,
  STATUS_INTERVAL_MS: 5 * 60_000,
  STATUS_MIN_INTERVAL_MS: 35_000,
});
