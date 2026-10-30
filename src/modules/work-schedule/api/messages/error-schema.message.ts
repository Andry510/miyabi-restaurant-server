export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  name: {
    type: 'El nombre debe ser un texto válido',
    minLength: 'El nombre debe tener al menos 2 caracteres',
    maxLength: 'El nombre no puede tener más de 100 caracteres',
  },
  start_time: {
    type: 'La hora de inicio debe ser un texto válido',
    format: 'La hora de inicio debe tener el formato HH:MM',
  },
  end_time: {
    type: 'La hora de fin debe ser un texto válido',
    format: 'La hora de fin debe tener el formato HH:MM',
  },
  times: {
    equal: 'La hora de inicio y la de fin no pueden ser iguales',
  },
  break_minutes: {
    type: 'El descanso debe ser un número',
    integer: 'El descanso debe ser un número entero de minutos',
    range: 'El descanso debe estar entre 0 y 480 minutos',
  },
  late_tolerance_minutes: {
    type: 'La tolerancia debe ser un número',
    integer: 'La tolerancia debe ser un número entero de minutos',
    range: 'La tolerancia debe estar entre 0 y 120 minutos',
  },
  early_leave_tolerance_minutes: {
    type: 'La tolerancia de salida debe ser un número',
    integer: 'La tolerancia de salida debe ser un número entero de minutos',
    range: 'La tolerancia de salida debe estar entre 0 y 120 minutos',
  },
  status: {
    type: 'El estado debe ser un valor booleano',
  },
});
