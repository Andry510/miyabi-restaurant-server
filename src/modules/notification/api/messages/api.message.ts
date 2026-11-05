export const API_NOTIFICATION_MESSAGE = Object.freeze({
  ERROR: {
    INVALID_CURSOR: {
      code: 'ERROR_NOTIFICATION_INVALID_CURSOR',
      message: 'El cursor de la lista no es válido',
    },
  },
  SUCCESS: {
    NOTIFICATIONS_RETRIEVED: {
      code: 'SUCCESS_NOTIFICATIONS_RETRIEVED',
      message: 'Notificaciones obtenidas correctamente',
    },
    UNREAD_COUNT_RETRIEVED: {
      code: 'SUCCESS_NOTIFICATIONS_UNREAD_COUNT_RETRIEVED',
      message: 'Notificaciones sin leer obtenidas correctamente',
    },
    NOTIFICATIONS_READ: {
      code: 'SUCCESS_NOTIFICATIONS_READ',
      message: 'Notificaciones marcadas como leídas',
    },
  },
});
