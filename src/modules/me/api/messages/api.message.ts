export const API_ME_MESSAGE = Object.freeze({
  ERROR: {
    INVALID_CURRENT_PASSWORD: {
      code: 'ERROR_ME_INVALID_CURRENT_PASSWORD',
      message: 'La contraseña actual no es correcta',
    },
    PHONE_NUMBER_ALREADY_IN_USE: {
      code: 'ERROR_ME_PHONE_NUMBER_ALREADY_IN_USE',
      message: 'El teléfono ya está registrado',
    },
  },
  SUCCESS: {
    PASSWORD_CHANGED: {
      code: 'SUCCESS_ME_PASSWORD_CHANGED',
      message: 'Contraseña actualizada; inicia sesión de nuevo',
    },
    PROFILE_UPDATED: {
      code: 'SUCCESS_ME_PROFILE_UPDATED',
      message: 'Perfil actualizado correctamente',
    },
    USER_RETRIEVED: {
      code: 'SUCCESS_ME_USER_RETRIEVED',
      message: 'Perfil obtenido correctamente',
    },
    LOCATION_RETRIEVED: {
      code: 'SUCCESS_ME_LOCATION_RETRIEVED',
      message: 'Local obtenido correctamente',
    },
    NOTIFICATIONS_RETRIEVED: {
      code: 'SUCCESS_ME_NOTIFICATIONS_RETRIEVED',
      message: 'Notificaciones obtenidas correctamente',
    },
    UNREAD_COUNT_RETRIEVED: {
      code: 'SUCCESS_ME_NOTIFICATIONS_UNREAD_COUNT_RETRIEVED',
      message: 'Notificaciones sin leer obtenidas correctamente',
    },
    NOTIFICATIONS_READ: {
      code: 'SUCCESS_ME_NOTIFICATIONS_READ',
      message: 'Notificaciones marcadas como leídas',
    },
  },
});
