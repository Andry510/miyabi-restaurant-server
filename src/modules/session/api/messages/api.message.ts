export const API_SESSION_MESSAGE = Object.freeze({
  ERROR: {
    REFRESH_TOKEN_ROTATED: {
      code: 'ERROR_REFRESH_TOKEN_ROTATED',
      message:
        'La sesión ya se renovó con este token; usa el último token que recibiste',
    },
    REFRESH_TOKEN_REUSED: {
      code: 'ERROR_REFRESH_TOKEN_REUSED',
      message:
        'Se usó un token de renovación anterior; por seguridad cerramos la sesión, inicia sesión de nuevo',
    },
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
