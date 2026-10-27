export const API_WORK_SCHEDULE_MESSAGE = Object.freeze({
  ERROR: {
    WORK_SCHEDULE_NOT_FOUND: {
      code: 'ERROR_WORK_SCHEDULE_NOT_FOUND',
      message: 'No se encontró el horario',
    },
    HAS_SCHEDULED_SHIFTS: {
      code: 'ERROR_WORK_SCHEDULE_HAS_SCHEDULED_SHIFTS',
      message: 'No se puede eliminar: el horario tiene turnos programados',
    },
  },
  SUCCESS: {
    WORK_SCHEDULE_CREATED: {
      code: 'SUCCESS_WORK_SCHEDULE_CREATED',
      message: 'Horario creado correctamente',
    },
    WORK_SCHEDULES_RETRIEVED: {
      code: 'SUCCESS_WORK_SCHEDULES_RETRIEVED',
      message: 'Horarios obtenidos correctamente',
    },
    WORK_SCHEDULE_RETRIEVED: {
      code: 'SUCCESS_WORK_SCHEDULE_RETRIEVED',
      message: 'Horario obtenido correctamente',
    },
    WORK_SCHEDULE_UPDATED: {
      code: 'SUCCESS_WORK_SCHEDULE_UPDATED',
      message: 'Horario actualizado correctamente',
    },
    WORK_SCHEDULE_DELETED: {
      code: 'SUCCESS_WORK_SCHEDULE_DELETED',
      message: 'Horario eliminado correctamente',
    },
  },
});
