export const CLOUD_GRPC_CLIENT = Symbol('CLOUD_GRPC_CLIENT');

export const CLOUD_GRPC_PACKAGES = Object.freeze([
  'authentication',
  'location',
  'me',
  'product',
  'server_product',
  'server',
  'session',
  'supplier_product',
  'supplier',
  'transfer_item',
  'transfer',
]);

export const CLOUD_GRPC_SERVICE = Object.freeze({
  AUTHENTICATION: 'authentication_service',
  LOCATION: 'location_service',
  ME: 'me_service',
  PRODUCT: 'product_service',
  SERVER_PRODUCT: 'server_product_service',
  SERVER: 'server_service',
  SESSION: 'session_service',
  SUPPLIER_PRODUCT: 'supplier_product_service',
  SUPPLIER: 'supplier_service',
  TRANSFER_ITEM: 'transfer_item_service',
  TRANSFER: 'transfer_service',
});

export const CLOUD_GRPC_DEADLINE_MS = 10_000;
