export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  job_positions_ids: {
    type: 'Los puestos deben enviarse como una lista',
    minLength: 'Envía al menos un puesto',
    itemType: 'Cada puesto debe ser un texto válido',
    itemUuid: 'Cada puesto debe ser un UUID válido',
  },
  work_areas_ids: {
    type: 'Las áreas de trabajo deben enviarse como una lista',
    minLength: 'Envía al menos un área de trabajo',
    itemType: 'Cada área de trabajo debe ser un texto válido',
    itemUuid: 'Cada área de trabajo debe ser un UUID válido',
  },
});
