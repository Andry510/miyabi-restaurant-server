export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  product_id: {
    type: 'El producto debe ser un texto válido',
    uuid: 'El producto debe ser un UUID válido',
  },
  quantity: {
    type: 'La cantidad debe ser un número',
    integer: 'La cantidad debe ser un número entero',
    range: 'La cantidad está fuera del rango permitido',
  },
  note: {
    type: 'La nota debe ser un texto válido',
    maxLength: 'La nota no puede tener más de 255 caracteres',
  },
  to_location_id: {
    type: 'El almacén debe ser un texto válido',
    uuid: 'El almacén debe ser un UUID válido',
  },
  status: {
    enum: 'El estado debe ser open, sending, sent o partially_sent',
  },
  empty: 'Envía al menos un campo para actualizar',
});
