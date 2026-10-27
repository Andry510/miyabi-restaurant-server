export const API_CHECK_MESSAGE = Object.freeze({
  ERROR: {
    NO_SHIFT: {
      code: 'ERROR_CHECK_NO_SHIFT',
      message: 'No tienes un turno programado para hoy',
    },
    TOO_EARLY: {
      code: 'ERROR_CHECK_TOO_EARLY',
      message: 'Todavía es muy temprano para registrar tu entrada',
    },
    ALREADY_CHECKED_IN: {
      code: 'ERROR_CHECK_ALREADY_CHECKED_IN',
      message: 'Ya registraste tu entrada',
    },
    NOT_CHECKED_IN: {
      code: 'ERROR_CHECK_NOT_CHECKED_IN',
      message: 'Primero debes registrar tu entrada',
    },
  },
  SUCCESS: {
    CURRENT_RETRIEVED: {
      code: 'SUCCESS_CHECK_CURRENT_RETRIEVED',
      message: 'Asistencia actual obtenida correctamente',
    },
    CHECKED_IN: {
      code: 'SUCCESS_CHECK_CHECKED_IN',
      message: 'Entrada registrada correctamente',
    },
    CHECKED_OUT: {
      code: 'SUCCESS_CHECK_CHECKED_OUT',
      message: 'Salida registrada correctamente',
    },
  },
});
