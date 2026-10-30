export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  user_id: {
    type: 'El empleado debe ser un texto válido',
    uuid: 'El empleado debe ser un UUID válido',
  },
  work_schedule_id: {
    type: 'El horario debe ser un texto válido',
    uuid: 'El horario debe ser un UUID válido',
  },
  dates: {
    type: 'Las fechas deben enviarse como una lista',
    itemType: 'Cada fecha debe ser un texto válido',
    itemDate: 'Cada fecha debe tener el formato AAAA-MM-DD',
    minLength: 'Envía al menos una fecha',
    maxLength: 'Puedes programar hasta 31 fechas a la vez',
  },
  date: {
    type: 'La fecha debe ser un texto válido',
    format: 'La fecha debe tener el formato AAAA-MM-DD',
  },
  note: {
    type: 'La nota debe ser un texto válido',
    maxLength: 'La nota no puede tener más de 500 caracteres',
  },
  status: {
    enum: 'El estado debe ser scheduled, completed o cancelled',
  },
  attendance: {
    enum: 'La asistencia debe ser present, absent, excused o incomplete',
  },
  clock_in: {
    type: 'La entrada debe ser una fecha y hora ISO válida',
  },
  clock_out: {
    type: 'La salida debe ser una fecha y hora ISO válida',
  },
  clock: {
    required: 'Envía la hora de entrada, la de salida o ambas',
  },
  week: {
    isoDate: 'La semana debe ser una fecha AAAA-MM-DD',
  },
  user_ids: {
    type: 'Los empleados deben enviarse como una lista',
    itemType: 'Cada empleado debe ser un texto válido',
    itemUuid: 'Cada empleado debe ser un UUID válido',
  },
  reason: {
    type: 'El motivo debe ser un texto válido',
    minLength: 'El motivo debe tener al menos 3 caracteres',
    maxLength: 'El motivo no puede tener más de 500 caracteres',
  },
  justification_type: {
    picklist: 'La incidencia debe ser absence, late_arrival o early_departure',
  },
});
