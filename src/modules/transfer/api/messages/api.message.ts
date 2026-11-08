export const API_TRANSFER_MESSAGE = Object.freeze({
  SUCCESS: {
    TRANSFER_CREATED: {
      code: 'SUCCESS_TRANSFER_CREATED',
      message: 'Pedido creado correctamente',
    },
    TRANSFERS_RETRIEVED: {
      code: 'SUCCESS_TRANSFERS_RETRIEVED',
      message: 'Pedidos obtenidos correctamente',
    },
    TRANSFER_RETRIEVED: {
      code: 'SUCCESS_TRANSFER_RETRIEVED',
      message: 'Pedido obtenido correctamente',
    },
    TRANSFER_RECEIVED: {
      code: 'SUCCESS_TRANSFER_RECEIVED',
      message: 'Pedido recibido correctamente',
    },
    TRANSFER_CANCELLED: {
      code: 'SUCCESS_TRANSFER_CANCELLED',
      message: 'Pedido cancelado correctamente',
    },
  },
  ERROR: {
    TRANSFER_PROCESSING: {
      code: 'ERROR_TRANSFER_PROCESSING',
      message:
        'Este pedido tiene un cambio en proceso; espera a que la nube lo confirme',
    },
    TRANSFER_UNCONFIRMED: {
      code: 'ERROR_TRANSFER_UNCONFIRMED',
      message:
        'No hubo respuesta de la nube; el cambio quedó pendiente de confirmar y te avisaremos cuando se confirme',
    },
    TRANSFER_STATUS_CHANGED: {
      code: 'ERROR_TRANSFER_INVALID_STATUS',
      message:
        'Este pedido ya cambió de estado; actualízalo para ver cómo quedó',
    },
  },
});
