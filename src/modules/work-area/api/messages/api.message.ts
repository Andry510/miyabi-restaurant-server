export const API_WORK_AREA_MESSAGE = Object.freeze({
  ERROR: {
    NAME_ALREADY_IN_USE: {
      code: 'ERROR_WORK_AREA_NAME_ALREADY_IN_USE',
      message: 'Ya existe un área con ese nombre',
    },
    WORK_AREA_NOT_FOUND: {
      code: 'ERROR_WORK_AREA_NOT_FOUND',
      message: 'No se encontró el área de trabajo',
    },
    JOB_POSITION_NOT_FOUND: {
      code: 'ERROR_WORK_AREA_JOB_POSITION_NOT_FOUND',
      message: 'No se encontró el puesto',
    },
    HAS_EMPLOYEES: {
      code: 'ERROR_WORK_AREA_HAS_EMPLOYEES',
      message: 'No se puede eliminar: hay empleados en el área',
    },
  },
  SUCCESS: {
    WORK_AREA_CREATED: {
      code: 'SUCCESS_WORK_AREA_CREATED',
      message: 'Área creada correctamente',
    },
    WORK_AREAS_RETRIEVED: {
      code: 'SUCCESS_WORK_AREAS_RETRIEVED',
      message: 'Áreas obtenidas correctamente',
    },
    WORK_AREA_RETRIEVED: {
      code: 'SUCCESS_WORK_AREA_RETRIEVED',
      message: 'Área obtenida correctamente',
    },
    WORK_AREA_UPDATED: {
      code: 'SUCCESS_WORK_AREA_UPDATED',
      message: 'Área actualizada correctamente',
    },
    WORK_AREA_DELETED: {
      code: 'SUCCESS_WORK_AREA_DELETED',
      message: 'Área eliminada correctamente',
    },
  },
});
