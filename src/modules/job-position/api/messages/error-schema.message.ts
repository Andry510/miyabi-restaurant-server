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
  work_areas_ids: {
    type: 'Las áreas de trabajo deben enviarse como una lista',
    itemType: 'Cada área de trabajo debe ser un texto válido',
    itemUuid: 'Cada área de trabajo debe ser un UUID válido',
  },
});
