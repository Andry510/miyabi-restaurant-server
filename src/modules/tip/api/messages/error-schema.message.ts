export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  rules: {
    type: 'Las reglas deben enviarse como una lista',
    duplicated: 'Cada área de trabajo solo puede aparecer una vez',
    total: 'Los porcentajes deben sumar 100',
  },
  work_area_id: {
    type: 'El área de trabajo debe ser un texto válido',
    uuid: 'El área de trabajo debe ser un UUID válido',
  },
  percentage: {
    type: 'El porcentaje debe ser un número',
    decimals: 'El porcentaje admite máximo 2 decimales',
    range: 'El porcentaje debe estar entre 0.01 y 100',
  },
  method: {
    enum: 'El método debe ser equal, minutes, position_weight o manual',
  },
  weights: {
    type: 'Los pesos deben enviarse como una lista',
    duplicated: 'Cada puesto solo puede aparecer una vez por área',
  },
  job_position_id: {
    type: 'El puesto debe ser un texto válido',
    uuid: 'El puesto debe ser un UUID válido',
  },
  weight: {
    type: 'El peso debe ser un número',
    decimals: 'El peso admite máximo 2 decimales',
    range: 'El peso debe estar entre 0.01 y 10',
  },
  date: {
    type: 'La fecha debe ser un texto válido',
    format: 'La fecha debe tener el formato AAAA-MM-DD',
  },
  work_schedule_id: {
    type: 'El horario debe ser un texto válido',
    uuid: 'El horario debe ser un UUID válido',
  },
  amount: {
    type: 'El monto debe ser un número',
    decimals: 'El monto admite máximo 2 decimales',
    range: 'El monto está fuera del rango permitido',
  },
  note: {
    type: 'La nota debe ser un texto válido',
    maxLength: 'La nota no puede tener más de 500 caracteres',
  },
  allocations: {
    type: 'Los montos deben enviarse como una lista',
    duplicated: 'Cada empleado solo puede aparecer una vez',
  },
  user_id: {
    type: 'El empleado debe ser un texto válido',
    uuid: 'El empleado debe ser un UUID válido',
  },
  status: {
    enum: 'El estado debe ser open o closed',
  },
  enabled: {
    type: 'La participación del área debe ser un valor booleano',
  },
  name: {
    type: 'El nombre debe ser un texto válido',
    minLength: 'El nombre debe tener al menos 2 caracteres',
    maxLength: 'El nombre no puede tener más de 100 caracteres',
  },
  shifts: {
    type: 'Los turnos que quita deben ser un número',
    range: 'Los turnos que quita deben estar entre 0 y 10',
    step: 'Los turnos que quita deben ir en cuartos de turno (0.25)',
  },
  removes_all: {
    type: 'Quitar toda la propina debe ser un valor booleano',
  },
  sanction_type_id: {
    type: 'El tipo de sanción debe ser un texto válido',
    uuid: 'El tipo de sanción debe ser un UUID válido',
  },
  sanction_id: {
    type: 'La sanción debe ser un texto válido',
    uuid: 'La sanción debe ser un UUID válido',
  },
  empty: 'Envía al menos un campo para actualizar',
});
