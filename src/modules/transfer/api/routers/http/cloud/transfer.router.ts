export const HTTP_CLOUD_TRANSFER_ROUTER = Object.freeze({
  TRANSFER: {
    REGISTER: 'transfers/cloud',
    TRANSFERS: 'transfers/cloud',
    TRANSFER: 'transfers/cloud/:id',
  },
  FLOW: {
    RECEIVE: 'transfers/cloud/:id/receive',
    CANCEL: 'transfers/cloud/:id/cancel',
  },
});
