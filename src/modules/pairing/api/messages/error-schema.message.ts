export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  enrollment_token: {
    type: 'El token de alta debe ser un texto válido',
    nonEmpty: 'El token de alta es obligatorio',
  },
  name: {
    type: 'El nombre del servidor debe ser un texto válido',
    nonEmpty: 'El nombre del servidor es obligatorio',
    maxLength: 'El nombre del servidor no puede superar los 150 caracteres',
  },
});
