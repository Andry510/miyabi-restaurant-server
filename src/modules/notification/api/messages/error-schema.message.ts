export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  read: {
    type: 'El filtro read debe ser true o false',
  },
  cursor: {
    type: 'El cursor debe ser un texto válido',
  },
  limit: {
    range: 'El límite debe estar entre 1 y 100',
  },
  notification_ids: {
    type: 'Las notificaciones deben ser una lista de ids válidos',
    max: 'Se pueden marcar como máximo 100 notificaciones a la vez',
  },
});
