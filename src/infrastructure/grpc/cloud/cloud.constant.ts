export const CLOUD_GRPC_CLIENT = Symbol('CLOUD_GRPC_CLIENT');

export const CLOUD_GRPC_PACKAGES = Object.freeze([
  'authentication.v1',
  'location.v1',
  'me.v1',
  'product.v1',
  'server_product.v1',
  'server.v1',
  'session.v1',
  'supplier_product.v1',
  'supplier.v1',
  'transfer_item.v1',
  'transfer.v1',
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
