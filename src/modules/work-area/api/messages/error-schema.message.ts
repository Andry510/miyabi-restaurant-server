export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  name: {
    type: 'El nombre debe ser un texto válido',
    minLength: 'El nombre debe tener al menos 2 caracteres',
    maxLength: 'El nombre no puede tener más de 100 caracteres',
  },
  description: {
    type: 'La descripción debe ser un texto válido',
    maxLength: 'La descripción no puede tener más de 255 caracteres',
  },
  status: {
    type: 'El estado debe ser un valor booleano',
  },
  job_positions_ids: {
    type: 'Los puestos deben enviarse como una lista',
    itemType: 'Cada puesto debe ser un texto válido',
    itemUuid: 'Cada puesto debe ser un UUID válido',
  },
});
