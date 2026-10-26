export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  products_ids: {
    type: 'Los productos deben enviarse como una lista',
    minLength: 'Envía al menos un producto',
    itemType: 'Cada producto debe ser un texto válido',
    itemUuid: 'Cada producto debe ser un UUID válido',
  },
  work_areas_ids: {
    type: 'Las áreas de trabajo deben enviarse como una lista',
    minLength: 'Envía al menos un área de trabajo',
    itemType: 'Cada área de trabajo debe ser un texto válido',
    itemUuid: 'Cada área de trabajo debe ser un UUID válido',
  },
});
