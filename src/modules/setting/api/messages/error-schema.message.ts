export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  timezone: {
    enum: 'La zona horaria no está en la lista permitida',
  },
  clock_in_window_minutes: {
    type: 'La anticipación debe ser un número',
    integer: 'La anticipación debe ser un número entero de minutos',
    range: 'La anticipación debe estar entre 0 y 240 minutos',
  },
  tip_period: {
    enum: 'El modo de reparto debe ser day, week o shift',
  },
  empty: 'Envía al menos un campo para actualizar',
});
