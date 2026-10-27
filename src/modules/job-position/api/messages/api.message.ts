export const API_JOB_POSITION_MESSAGE = Object.freeze({
  ERROR: {
    NAME_ALREADY_IN_USE: {
      code: 'ERROR_JOB_POSITION_NAME_ALREADY_IN_USE',
      message: 'Ya existe un puesto con ese nombre',
    },
    JOB_POSITION_NOT_FOUND: {
      code: 'ERROR_JOB_POSITION_NOT_FOUND',
      message: 'No se encontró el puesto',
    },
    WORK_AREA_NOT_FOUND: {
      code: 'ERROR_JOB_POSITION_WORK_AREA_NOT_FOUND',
      message: 'No se encontró el área de trabajo',
    },
    HAS_EMPLOYEES: {
      code: 'ERROR_JOB_POSITION_HAS_EMPLOYEES',
      message: 'No se puede eliminar: hay empleados con ese puesto',
    },
  },
  SUCCESS: {
    JOB_POSITION_CREATED: {
      code: 'SUCCESS_JOB_POSITION_CREATED',
      message: 'Puesto creado correctamente',
    },
    JOB_POSITIONS_RETRIEVED: {
      code: 'SUCCESS_JOB_POSITIONS_RETRIEVED',
      message: 'Puestos obtenidos correctamente',
    },
    JOB_POSITION_RETRIEVED: {
      code: 'SUCCESS_JOB_POSITION_RETRIEVED',
      message: 'Puesto obtenido correctamente',
    },
    JOB_POSITION_UPDATED: {
      code: 'SUCCESS_JOB_POSITION_UPDATED',
      message: 'Puesto actualizado correctamente',
    },
    JOB_POSITION_DELETED: {
      code: 'SUCCESS_JOB_POSITION_DELETED',
      message: 'Puesto eliminado correctamente',
    },
  },
});
