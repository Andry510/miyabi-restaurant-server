export const API_AREA_JOB_POSITION_MESSAGE = Object.freeze({
  ERROR: {
    WORK_AREA_NOT_FOUND: {
      code: 'ERROR_AREA_JOB_POSITION_WORK_AREA_NOT_FOUND',
      message: 'No se encontró el área de trabajo',
    },
    JOB_POSITION_NOT_FOUND: {
      code: 'ERROR_AREA_JOB_POSITION_JOB_POSITION_NOT_FOUND',
      message: 'No se encontró el puesto',
    },
    NOT_LINKED: {
      code: 'ERROR_AREA_JOB_POSITION_NOT_LINKED',
      message: 'El puesto no está vinculado a esa área',
    },
    HAS_EMPLOYEES: {
      code: 'ERROR_AREA_JOB_POSITION_HAS_EMPLOYEES',
      message:
        'No se puede desvincular: hay empleados con ese puesto en el área',
    },
  },
  SUCCESS: {
    JOB_POSITIONS_RETRIEVED: {
      code: 'SUCCESS_AREA_JOB_POSITION_JOB_POSITIONS_RETRIEVED',
      message: 'Puestos del área obtenidos correctamente',
    },
    WORK_AREAS_RETRIEVED: {
      code: 'SUCCESS_AREA_JOB_POSITION_WORK_AREAS_RETRIEVED',
      message: 'Áreas del puesto obtenidas correctamente',
    },
    USERS_RETRIEVED: {
      code: 'SUCCESS_AREA_JOB_POSITION_USERS_RETRIEVED',
      message: 'Empleados del puesto obtenidos correctamente',
    },
    LINKED: {
      code: 'SUCCESS_AREA_JOB_POSITION_LINKED',
      message: 'Puesto vinculado al área correctamente',
    },
    UNLINKED: {
      code: 'SUCCESS_AREA_JOB_POSITION_UNLINKED',
      message: 'Puesto desvinculado del área correctamente',
    },
  },
});
