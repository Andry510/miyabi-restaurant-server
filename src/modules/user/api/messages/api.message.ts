export const API_USER_MESSAGE = Object.freeze({
  ERROR: {
    EMAIL_ALREADY_IN_USE: {
      code: 'ERROR_REGISTER_EMAIL_ALREADY_IN_USE',
      message: 'El correo ya está registrado',
    },
    PHONE_NUMBER_ALREADY_IN_USE: {
      code: 'ERROR_REGISTER_PHONE_NUMBER_ALREADY_IN_USE',
      message: 'El teléfono ya está registrado',
    },
    USER_NOT_EXIST: {
      code: 'ERROR_USER_NOT_EXIST',
      message: 'El usuario no existe',
    },
    AREA_JOB_POSITION_NOT_EXIST: {
      code: 'ERROR_USER_AREA_JOB_POSITION_NOT_EXIST',
      message: 'El puesto no existe en esa área',
    },
    NO_ACTIVE_SESSION: {
      code: 'ERROR_USER_NO_ACTIVE_SESSION',
      message: 'El usuario no tiene una sesión activa',
    },
  },
  SUCCESS: {
    USER_CREATED: {
      code: 'SUCCESS_USER_CREATED',
      message: 'Usuario creado correctamente',
    },
    USERS_RETRIEVED: {
      code: 'SUCCESS_USERS_RETRIEVED',
      message: 'Usuarios obtenidos correctamente',
    },
    USER_RETRIEVED: {
      code: 'SUCCESS_USER_RETRIEVED',
      message: 'Usuario obtenido correctamente',
    },
    USER_UPDATED: {
      code: 'SUCCESS_USER_UPDATED',
      message: 'Usuario actualizado correctamente',
    },
    USER_DELETED: {
      code: 'SUCCESS_USER_DELETED',
      message: 'Usuario eliminado correctamente',
    },
    PASSWORD_RESET: {
      code: 'SUCCESS_USER_PASSWORD_RESET',
      message: 'Contraseña temporal generada correctamente',
    },
    SESSION_REVOKED: {
      code: 'SUCCESS_USER_SESSION_REVOKED',
      message: 'Sesión del usuario cerrada correctamente',
    },
    SESSIONS_RETRIEVED: {
      code: 'SUCCESS_USER_SESSIONS_RETRIEVED',
      message: 'Sesiones del usuario obtenidas correctamente',
    },
    ATTENDANCE_RETRIEVED: {
      code: 'SUCCESS_USER_ATTENDANCE_RETRIEVED',
      message: 'Asistencia del empleado obtenida correctamente',
    },
  },
});
