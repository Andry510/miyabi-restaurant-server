export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  email: {
    type: 'El correo debe ser un texto válido',
    nonEmpty: 'El correo es obligatorio',
    email: 'El correo electrónico no es válido',
  },
  password: {
    type: 'La contraseña debe ser un texto válido',
    nonEmpty: 'La contraseña es obligatoria',
    minLength: 'La contraseña debe tener al menos 8 caracteres',
    match: 'Las contraseñas no coinciden',
  },
  mfa_key: {
    type: 'La clave MFA debe ser un texto válido',
    nonEmpty: 'La clave MFA es obligatoria',
  },
});
