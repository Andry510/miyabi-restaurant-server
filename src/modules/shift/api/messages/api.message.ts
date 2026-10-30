export const API_SHIFT_MESSAGE = Object.freeze({
  ERROR: {
    SHIFT_NOT_FOUND: {
      code: 'ERROR_SHIFT_NOT_FOUND',
      message: 'No se encontró el turno',
    },
    USER_NOT_FOUND: {
      code: 'ERROR_SHIFT_USER_NOT_FOUND',
      message: 'No se encontró al empleado',
    },
    USER_INACTIVE: {
      code: 'ERROR_SHIFT_USER_INACTIVE',
      message: 'El empleado está desactivado',
    },
    USER_WITHOUT_ASSIGNMENT: {
      code: 'ERROR_SHIFT_USER_WITHOUT_ASSIGNMENT',
      message: 'El empleado no tiene un área y puesto asignados',
    },
    WORK_SCHEDULE_INACTIVE: {
      code: 'ERROR_SHIFT_WORK_SCHEDULE_INACTIVE',
      message: 'El horario está desactivado',
    },
    OVERLAP: {
      code: 'ERROR_SHIFT_OVERLAP',
      message: 'El turno se cruza con otro turno del empleado',
    },
    NOT_EDITABLE: {
      code: 'ERROR_SHIFT_NOT_EDITABLE',
      message: 'El turno ya no se puede modificar',
    },
    CANCELLED: {
      code: 'ERROR_SHIFT_CANCELLED',
      message: 'El turno está cancelado',
    },
    NOT_STARTED: {
      code: 'ERROR_SHIFT_NOT_STARTED',
      message: 'El turno todavía no empieza',
    },
    NOT_FINISHED: {
      code: 'ERROR_SHIFT_NOT_FINISHED',
      message: 'El turno todavía no termina',
    },
    TIP_POOL_CLOSED: {
      code: 'ERROR_SHIFT_TIP_POOL_CLOSED',
      message:
        'El turno está en un reparto de propinas cerrado; reábrelo primero',
    },
    INVALID_TIMES: {
      code: 'ERROR_SHIFT_INVALID_TIMES',
      message:
        'La entrada debe ser antes de la salida, cerca del turno y no en el futuro',
    },
    CLOCK_IN_REQUIRED: {
      code: 'ERROR_SHIFT_CLOCK_IN_REQUIRED',
      message: 'El turno no tiene entrada; envía la hora de entrada',
    },
    NOT_ABSENT: {
      code: 'ERROR_SHIFT_NOT_ABSENT',
      message: 'El empleado sí registró entrada en este turno',
    },
    NO_INCIDENT: {
      code: 'ERROR_SHIFT_NO_INCIDENT',
      message: 'El turno no tiene esa incidencia',
    },
    WEEK_START: {
      code: 'ERROR_SHIFT_WEEK_START',
      message:
        'Las fechas deben caer en el día de inicio de semana del restaurante',
    },
    SAME_WEEK: {
      code: 'ERROR_SHIFT_SAME_WEEK',
      message: 'La semana destino debe ser distinta de la semana origen',
    },
    ALREADY_JUSTIFIED: {
      code: 'ERROR_SHIFT_ALREADY_JUSTIFIED',
      message: 'La incidencia ya está justificada',
    },
  },
  SUCCESS: {
    SHIFTS_CREATED: {
      code: 'SUCCESS_SHIFTS_CREATED',
      message: 'Turnos creados correctamente',
    },
    SHIFTS_RETRIEVED: {
      code: 'SUCCESS_SHIFTS_RETRIEVED',
      message: 'Turnos obtenidos correctamente',
    },
    SHIFT_RETRIEVED: {
      code: 'SUCCESS_SHIFT_RETRIEVED',
      message: 'Turno obtenido correctamente',
    },
    SHIFT_UPDATED: {
      code: 'SUCCESS_SHIFT_UPDATED',
      message: 'Turno actualizado correctamente',
    },
    WEEK_COPIED: {
      code: 'SUCCESS_SHIFT_WEEK_COPIED',
      message: 'Semana copiada correctamente',
    },
    ATTENDANCE_CORRECTED: {
      code: 'SUCCESS_SHIFT_ATTENDANCE_CORRECTED',
      message: 'Asistencia corregida correctamente',
    },
    JUSTIFIED: {
      code: 'SUCCESS_SHIFT_JUSTIFIED',
      message: 'Incidencia justificada correctamente',
    },
    SHIFT_CANCELLED: {
      code: 'SUCCESS_SHIFT_CANCELLED',
      message: 'Turno cancelado correctamente',
    },
  },
});
