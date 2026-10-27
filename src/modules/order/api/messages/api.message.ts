export const API_ORDER_MESSAGE = Object.freeze({
  ERROR: {
    WITHOUT_ASSIGNMENT: {
      code: 'ERROR_ORDER_WITHOUT_ASSIGNMENT',
      message: 'Necesitas un área asignada para hacer pedidos',
    },
    PRODUCT_NOT_IN_AREA: {
      code: 'ERROR_ORDER_PRODUCT_NOT_IN_AREA',
      message: 'El producto no pertenece a tu área',
    },
    PRODUCT_NOT_FOUND: {
      code: 'ERROR_ORDER_PRODUCT_NOT_FOUND',
      message: 'No se encontró el producto',
    },
    REQUEST_NOT_FOUND: {
      code: 'ERROR_ORDER_REQUEST_NOT_FOUND',
      message: 'No se encontró la solicitud',
    },
    ORDER_NOT_OPEN: {
      code: 'ERROR_ORDER_NOT_OPEN',
      message: 'El pedido ya no está abierto',
    },
    NO_OPEN_ORDER: {
      code: 'ERROR_ORDER_NO_OPEN_ORDER',
      message: 'No hay un pedido abierto',
    },
    ORDER_NOT_FOUND: {
      code: 'ERROR_ORDER_NOT_FOUND',
      message: 'No se encontró el pedido',
    },
    EMPTY_ORDER: {
      code: 'ERROR_ORDER_EMPTY',
      message: 'El pedido no tiene productos',
    },
    MISSING_WAREHOUSE: {
      code: 'ERROR_ORDER_MISSING_WAREHOUSE',
      message: 'Falta el almacén al que se enviará el pedido',
    },
    NOTHING_TO_RETRY: {
      code: 'ERROR_ORDER_NOTHING_TO_RETRY',
      message: 'Este pedido no tiene envíos pendientes por reintentar',
    },
  },
  SUCCESS: {
    REQUEST_SAVED: {
      code: 'SUCCESS_ORDER_REQUEST_SAVED',
      message: 'Solicitud guardada correctamente',
    },
    REQUEST_UPDATED: {
      code: 'SUCCESS_ORDER_REQUEST_UPDATED',
      message: 'Solicitud actualizada correctamente',
    },
    REQUEST_DELETED: {
      code: 'SUCCESS_ORDER_REQUEST_DELETED',
      message: 'Solicitud eliminada correctamente',
    },
    MY_REQUESTS_RETRIEVED: {
      code: 'SUCCESS_ORDER_MY_REQUESTS_RETRIEVED',
      message: 'Tus solicitudes obtenidas correctamente',
    },
    CURRENT_RETRIEVED: {
      code: 'SUCCESS_ORDER_CURRENT_RETRIEVED',
      message: 'Pedido actual obtenido correctamente',
    },
    ITEM_SAVED: {
      code: 'SUCCESS_ORDER_ITEM_SAVED',
      message: 'Producto del pedido guardado correctamente',
    },
    ITEM_RESET: {
      code: 'SUCCESS_ORDER_ITEM_RESET',
      message: 'Producto del pedido restablecido correctamente',
    },
    ORDER_SENT: {
      code: 'SUCCESS_ORDER_SENT',
      message: 'Pedido enviado correctamente',
    },
    ORDERS_RETRIEVED: {
      code: 'SUCCESS_ORDERS_RETRIEVED',
      message: 'Pedidos obtenidos correctamente',
    },
    ORDER_RETRIEVED: {
      code: 'SUCCESS_ORDER_RETRIEVED',
      message: 'Pedido obtenido correctamente',
    },
  },
});
