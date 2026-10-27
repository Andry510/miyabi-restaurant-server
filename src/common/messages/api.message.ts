export const API_MESSAGE_GLOBAL = Object.freeze({
  SUCCESS: {
    CREATED: {
      code: 'SUCCESS_CREATED',
      message: 'Registro creado correctamente',
    },
    RETRIEVED: {
      code: 'SUCCESS_RETRIEVED',
      message: 'Información obtenida correctamente',
    },
    PICTURE_UPLOADED: {
      code: 'SUCCESS_PICTURE_UPLOADED',
      message: 'Imagen subida correctamente',
    },
    PICTURE_REMOVED: {
      code: 'SUCCESS_PICTURE_REMOVED',
      message: 'Imagen eliminada correctamente',
    },
  },

  ERROR: {
    PICTURE_TOO_LARGE: {
      code: 'ERROR_PICTURE_TOO_LARGE',
      message: 'La imagen supera el tamaño permitido',
    },
    BAD_REQUEST: {
      code: 'ERROR_BAD_REQUEST',
      message: 'Los datos enviados no son válidos',
    },
    UNAUTHORIZED: {
      code: 'ERROR_UNAUTHORIZED',
      message: 'No estás autorizado, inicia sesión de nuevo',
    },
    MISSING_TOKEN: {
      code: 'ERROR_MISSING_TOKEN',
      message: 'Falta la sesión, inicia sesión de nuevo',
    },
    INVALID_ACCESS_TOKEN: {
      code: 'ERROR_INVALID_ACCESS_TOKEN',
      message: 'La sesión no es válida, inicia sesión de nuevo',
    },
    EXPIRED_TOKEN: {
      code: 'ERROR_EXPIRED_TOKEN',
      message: 'La sesión expiró, renuévala o inicia sesión de nuevo',
    },
    USER_WITHOUT_ASSIGNMENT: {
      code: 'ERROR_USER_WITHOUT_ASSIGNMENT',
      message: 'No tienes un área y puesto asignados',
    },
    FORBIDDEN: {
      code: 'ERROR_FORBIDDEN',
      message: 'No tienes permiso para realizar esta acción',
    },
    NOT_FOUND: {
      code: 'ERROR_NOT_FOUND',
      message: 'No se encontró lo que buscas',
    },
    METHOD_NOT_ALLOWED: {
      code: 'ERROR_METHOD_NOT_ALLOWED',
      message: 'Esta operación no está permitida',
    },
    PAYLOAD_TOO_LARGE: {
      code: 'ERROR_PAYLOAD_TOO_LARGE',
      message: 'La información enviada supera el tamaño permitido',
    },
    TOO_MANY_REQUESTS: {
      code: 'ERROR_TOO_MANY_REQUESTS',
      message: 'Demasiadas solicitudes, intenta de nuevo en un momento',
    },
    CONFLICT: {
      code: 'ERROR_CONFLICT',
      message: 'La operación entra en conflicto con el estado actual',
    },
    INTERNAL_ERROR: {
      code: 'ERROR_INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado, intenta de nuevo',
    },
    SERVICE_UNAVAILABLE: {
      code: 'ERROR_SERVICE_UNAVAILABLE',
      message: 'El servicio no está disponible en este momento',
    },
    CLOUD_UNAVAILABLE: {
      code: 'ERROR_CLOUD_UNAVAILABLE',
      message: 'No hay conexión con la nube, intenta de nuevo en un momento',
    },
    SERVER_NOT_PAIRED: {
      code: 'ERROR_SERVER_NOT_PAIRED',
      message: 'El servidor del local todavía no está emparejado',
    },
    MISSING_REFRESH_TOKEN: {
      code: 'ERROR_MISSING_REFRESH_TOKEN',
      message: 'Falta el token para renovar la sesión',
    },
    INVALID_TOKEN: {
      code: 'ERROR_INVALID_TOKEN',
      message: 'El token no es válido',
    },
    INVALID_REFRESH_TOKEN: {
      code: 'ERROR_INVALID_REFRESH_TOKEN',
      message: 'El token para renovar la sesión no es válido',
    },
    EXPIRED_REFRESH_TOKEN: {
      code: 'ERROR_EXPIRED_REFRESH_TOKEN',
      message: 'La sesión expiró, inicia sesión de nuevo',
    },
    ACCOUNT_DISABLED: {
      code: 'ERROR_ACCOUNT_DISABLED',
      message: 'La cuenta está desactivada',
    },
  },
});
