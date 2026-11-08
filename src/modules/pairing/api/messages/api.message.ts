export const API_PAIRING_MESSAGE = Object.freeze({
  ERROR: {
    ALREADY_PAIRED: {
      code: 'ERROR_SERVER_ALREADY_PAIRED',
      message: 'El servidor ya está emparejado',
    },
    NOT_UNLINKED: {
      code: 'ERROR_SERVER_NOT_UNLINKED',
      message:
        'Solo se puede cambiar el token de un servidor desvinculado; si nunca se emparejó, empareja el servidor',
    },
    INVALID_TOKEN: {
      code: 'ERROR_SERVER_TOKEN_INVALID',
      message: 'El token del servidor no es válido o la nube lo rechazó',
    },
    LOCATION_MISMATCH: {
      code: 'ERROR_SERVER_LOCATION_MISMATCH',
      message:
        'El token es de otro restaurante; para cambiar de restaurante empareja el servidor como nuevo',
    },
  },
  SUCCESS: {
    SERVER_PAIRED: {
      code: 'SUCCESS_SERVER_PAIRED',
      message: 'Servidor emparejado correctamente',
    },
    TOKEN_REPLACED: {
      code: 'SUCCESS_SERVER_TOKEN_REPLACED',
      message: 'Token del servidor actualizado correctamente',
    },
    STATUS_RETRIEVED: {
      code: 'SUCCESS_SERVER_STATUS_RETRIEVED',
      message: 'Estado del servidor obtenido correctamente',
    },
  },
});
