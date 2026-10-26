export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  name: {
    type: 'El nombre debe ser un texto válido',
  },
  phone_number: {
    type: 'El teléfono debe ser un texto válido',
  },
  type: {
    enum: 'El tipo de ubicación debe ser uno de los valores permitidos',
  },
});
