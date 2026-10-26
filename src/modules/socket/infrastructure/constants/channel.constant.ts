export const SOCKET_EVENT = Object.freeze({
  SESSION_EXPIRED: 'session.expired',
  SESSION_REVOKED: 'session.revoked',
  SERVER_SYNC_REQUIRED: 'server.sync_required',
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_REMOVED: 'product.removed',
  TRANSFER_CREATED: 'transfer.created',
  TRANSFER_STATUS_CHANGED: 'transfer.status_changed',
  TRANSFER_DELIVERY_ASSIGNED: 'transfer.delivery_assigned',
});

export const SOCKET_HANDSHAKE_KEY = Object.freeze({
  SERVER_TOKEN: 'server_token',
});

export const SOCKET_LIMITS = Object.freeze({
  RETRY_MS: 30_000,
});
