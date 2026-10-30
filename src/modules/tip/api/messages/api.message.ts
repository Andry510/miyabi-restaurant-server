export const API_TIP_MESSAGE = Object.freeze({
  ERROR: {
    WORK_AREA_NOT_FOUND: {
      code: 'ERROR_TIP_WORK_AREA_NOT_FOUND',
      message: 'No se encontró el área de trabajo',
    },
    POSITION_NOT_LINKED: {
      code: 'ERROR_TIP_POSITION_NOT_LINKED',
      message: 'El puesto no está vinculado a esa área',
    },
    RULES_INCOMPLETE: {
      code: 'ERROR_TIP_RULES_INCOMPLETE',
      message: 'Las reglas de reparto de propinas están incompletas',
    },
    PERIOD_MISMATCH: {
      code: 'ERROR_TIP_PERIOD_MISMATCH',
      message: 'El periodo no coincide con el de la bolsa de propinas',
    },
    OVERLAP: {
      code: 'ERROR_TIP_OVERLAP',
      message: 'El periodo se cruza con otra bolsa de propinas',
    },
    SHIFT_TAKEN: {
      code: 'ERROR_TIP_SHIFT_TAKEN',
      message: 'Uno o más turnos ya pertenecen a otra bolsa de propinas',
    },
    POOL_NOT_FOUND: {
      code: 'ERROR_TIP_POOL_NOT_FOUND',
      message: 'No se encontró la bolsa de propinas',
    },
    POOL_NOT_OPEN: {
      code: 'ERROR_TIP_POOL_NOT_OPEN',
      message: 'La bolsa de propinas no está abierta',
    },
    POOL_NOT_CLOSED: {
      code: 'ERROR_TIP_POOL_NOT_CLOSED',
      message: 'La bolsa de propinas no está cerrada',
    },
    PENDING_SHIFTS: {
      code: 'ERROR_TIP_PENDING_SHIFTS',
      message: 'Hay turnos sin cerrar en el periodo',
    },
    NO_PARTICIPANTS: {
      code: 'ERROR_TIP_NO_PARTICIPANTS',
      message: 'No hay empleados para repartir la propina',
    },
    MANUAL_MISMATCH: {
      code: 'ERROR_TIP_MANUAL_MISMATCH',
      message: 'El reparto manual no suma el total de la propina',
    },
    AREA_NOT_IN_POOL: {
      code: 'ERROR_TIP_AREA_NOT_IN_POOL',
      message: 'El área no participa en esta bolsa de propinas',
    },
    USER_NOT_IN_AREA: {
      code: 'ERROR_TIP_USER_NOT_IN_AREA',
      message: 'El empleado no pertenece a esa área',
    },
    USER_NOT_IN_POOL: {
      code: 'ERROR_TIP_USER_NOT_IN_POOL',
      message: 'El empleado no participa en esta bolsa de propinas',
    },
    SANCTION_TYPE_NOT_FOUND: {
      code: 'ERROR_TIP_SANCTION_TYPE_NOT_FOUND',
      message: 'No se encontró el tipo de sanción',
    },
    SANCTION_TYPE_DUPLICATED: {
      code: 'ERROR_TIP_SANCTION_TYPE_DUPLICATED',
      message: 'Ya existe un tipo de sanción con ese nombre',
    },
    SANCTION_TYPE_IN_USE: {
      code: 'ERROR_TIP_SANCTION_TYPE_IN_USE',
      message:
        'El tipo de sanción ya se usó en un reparto y no se puede borrar',
    },
    SANCTION_NOT_FOUND: {
      code: 'ERROR_TIP_SANCTION_NOT_FOUND',
      message: 'No se encontró la sanción en esta bolsa de propinas',
    },
  },
  SUCCESS: {
    RULES_RETRIEVED: {
      code: 'SUCCESS_TIP_RULES_RETRIEVED',
      message: 'Reglas de propinas obtenidas correctamente',
    },
    RULES_UPDATED: {
      code: 'SUCCESS_TIP_RULES_UPDATED',
      message: 'Reglas de propinas actualizadas correctamente',
    },
    POOLS_RETRIEVED: {
      code: 'SUCCESS_TIP_POOLS_RETRIEVED',
      message: 'Bolsas de propinas obtenidas correctamente',
    },
    POOL_RETRIEVED: {
      code: 'SUCCESS_TIP_POOL_RETRIEVED',
      message: 'Bolsa de propinas obtenida correctamente',
    },
    POOL_CREATED: {
      code: 'SUCCESS_TIP_POOL_CREATED',
      message: 'Bolsa de propinas creada correctamente',
    },
    POOL_UPDATED: {
      code: 'SUCCESS_TIP_POOL_UPDATED',
      message: 'Bolsa de propinas actualizada correctamente',
    },
    AREA_UPDATED: {
      code: 'SUCCESS_TIP_AREA_UPDATED',
      message: 'Propina del área actualizada correctamente',
    },
    AREA_RESET: {
      code: 'SUCCESS_TIP_AREA_RESET',
      message: 'Propina del área restablecida correctamente',
    },
    POOL_CLOSED: {
      code: 'SUCCESS_TIP_POOL_CLOSED',
      message: 'Bolsa de propinas cerrada correctamente',
    },
    POOL_REOPENED: {
      code: 'SUCCESS_TIP_POOL_REOPENED',
      message: 'Bolsa de propinas reabierta correctamente',
    },
    POOL_DELETED: {
      code: 'SUCCESS_TIP_POOL_DELETED',
      message: 'Bolsa de propinas eliminada correctamente',
    },
    AREA_STATUS_UPDATED: {
      code: 'SUCCESS_TIP_AREA_STATUS_UPDATED',
      message: 'Participación del área actualizada correctamente',
    },
    POOL_EXPORTED: {
      code: 'SUCCESS_TIP_POOL_EXPORTED',
      message: 'Reparto exportado correctamente',
    },
    SANCTION_TYPES_RETRIEVED: {
      code: 'SUCCESS_TIP_SANCTION_TYPES_RETRIEVED',
      message: 'Tipos de sanción obtenidos correctamente',
    },
    SANCTION_TYPE_CREATED: {
      code: 'SUCCESS_TIP_SANCTION_TYPE_CREATED',
      message: 'Tipo de sanción creado correctamente',
    },
    SANCTION_TYPE_UPDATED: {
      code: 'SUCCESS_TIP_SANCTION_TYPE_UPDATED',
      message: 'Tipo de sanción actualizado correctamente',
    },
    SANCTION_TYPE_DELETED: {
      code: 'SUCCESS_TIP_SANCTION_TYPE_DELETED',
      message: 'Tipo de sanción eliminado correctamente',
    },
    SANCTION_ADDED: {
      code: 'SUCCESS_TIP_SANCTION_ADDED',
      message: 'Sanción aplicada correctamente',
    },
    SANCTION_REMOVED: {
      code: 'SUCCESS_TIP_SANCTION_REMOVED',
      message: 'Sanción quitada correctamente',
    },
    MY_TIPS_RETRIEVED: {
      code: 'SUCCESS_TIP_MY_TIPS_RETRIEVED',
      message: 'Tus propinas obtenidas correctamente',
    },
  },
});
