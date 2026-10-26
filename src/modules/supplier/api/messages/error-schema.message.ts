export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  first_name: {
    type: 'El nombre debe ser un texto válido',
  },
  last_name: {
    type: 'El apellido debe ser un texto válido',
  },
  email: {
    type: 'El correo debe ser un texto válido',
  },
  phone_number: {
    type: 'El teléfono debe ser un texto válido',
  },
  phone_numbers: {
    type: 'Los teléfonos deben ser una lista válida',
  },
});
