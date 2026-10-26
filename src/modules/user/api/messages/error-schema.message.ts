export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  first_name: {
    type: 'El nombre debe ser un texto válido',
    minLength: 'El nombre debe tener al menos 2 caracteres',
    maxLength: 'El nombre no puede tener más de 100 caracteres',
  },
  last_name: {
    type: 'El apellido debe ser un texto válido',
    minLength: 'El apellido debe tener al menos 2 caracteres',
    maxLength: 'El apellido no puede tener más de 100 caracteres',
  },
  email: {
    type: 'El correo debe ser un texto válido',
    nonEmpty: 'El correo es obligatorio',
    email: 'El correo electrónico no es válido',
  },
  password: {
    type: 'La contraseña debe ser un texto válido',
    minLength: 'La contraseña debe tener al menos 8 caracteres',
  },
  phone_number: {
    type: 'El teléfono debe ser un texto válido',
    length: 'El teléfono debe tener exactamente 10 dígitos',
  },
  status: {
    type: 'El estado debe ser un valor booleano',
  },
  reset_password: {
    type: 'La opción de restablecer contraseña debe ser un valor booleano',
  },
  work_area_id: {
    type: 'El área de trabajo debe ser un texto válido',
    uuid: 'El área de trabajo debe ser un UUID válido',
  },
  job_position_id: {
    type: 'El puesto debe ser un texto válido',
    uuid: 'El puesto debe ser un UUID válido',
  },
  assignment: {
    pair: 'El área de trabajo y el puesto se envían juntos',
  },
});
