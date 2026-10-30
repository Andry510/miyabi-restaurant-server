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
  late_arrival_shifts: {
    type: 'Lo que quita un retardo debe ser un número de turnos',
    range: 'Lo que quita un retardo debe estar entre 0 y 10 turnos',
    step: 'Lo que quita un retardo debe ir en cuartos de turno (0.25)',
  },
  absence_shifts: {
    type: 'Lo que quita una falta debe ser un número de turnos',
    range: 'Lo que quita una falta debe estar entre 0 y 10 turnos',
    step: 'Lo que quita una falta debe ir en cuartos de turno (0.25)',
  },
  week_start_day: {
    enum: 'El inicio de semana debe ser un día en inglés, ej. monday',
  },
  tip_sanction_destination: {
    enum: 'El destino de las sanciones debe ser fund, area o all',
  },
  empty: 'Envía al menos un campo para actualizar',
});
