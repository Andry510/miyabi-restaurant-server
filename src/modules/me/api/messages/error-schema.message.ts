export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  password: {
    type: 'La contraseña debe ser un texto válido',
    nonEmpty: 'La contraseña es obligatoria',
    minLength: 'La contraseña debe tener al menos 8 caracteres',
    match: 'Las contraseñas no coinciden',
    same: 'La nueva contraseña debe ser distinta de la actual',
  },
  phone_number: {
    type: 'El teléfono debe ser un texto válido',
    length: 'El teléfono debe tener exactamente 10 dígitos',
  },
  picture: {
    type: 'La imagen debe enviarse como bytes',
    nonEmpty: 'La imagen no puede estar vacía',
    format: 'La imagen debe ser JPG, PNG o WEBP',
  },
});
