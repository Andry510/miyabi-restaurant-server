export const HTTP_LOCAL_ORDER_ROUTER = Object.freeze({
  REQUESTS: 'orders/local/requests',
  REQUEST: 'orders/local/requests/:id',
  MINE: 'me/local/orders',
  CURRENT: 'orders/local/current',
  ITEM: 'orders/local/current/items/:product_id',
  SEND: 'orders/local/current/send',
  ORDERS: 'orders/local',
  ORDER: 'orders/local/:id',
  RETRY: 'orders/local/:id/retry',
});
