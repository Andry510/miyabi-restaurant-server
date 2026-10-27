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
    SHIFT_CANCELLED: {
      code: 'SUCCESS_SHIFT_CANCELLED',
      message: 'Turno cancelado correctamente',
    },
  },
});
