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
});
