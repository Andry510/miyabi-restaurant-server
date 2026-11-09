export const API_SESSION_MESSAGE = Object.freeze({
  ERROR: {
    MANAGER_SESSION_INVALID: {
      code: 'ERROR_MANAGER_SESSION_INVALID',
      message: 'La sesión no es válida; inicia sesión de nuevo',
    },
    MANAGER_SESSION_EXPIRED: {
      code: 'ERROR_MANAGER_SESSION_EXPIRED',
      message:
        'La sesión venció por inactividad o fue cerrada; inicia sesión de nuevo',
    },
    MANAGER_SESSION_REVOKED: {
      code: 'ERROR_MANAGER_SESSION_REVOKED',
      message: 'Un administrador cerró tu sesión; inicia sesión de nuevo',
    },
  },
  SUCCESS: {
    TOKEN_UPDATED: {
      code: 'SUCCESS_TOKEN_UPDATED',
      message: 'Sesión renovada correctamente',
    },
    SESSION_LOGGED_OUT: {
      code: 'SUCCESS_SESSION_LOGGED_OUT',
      message: 'Sesión cerrada correctamente',
    },
  },
});
