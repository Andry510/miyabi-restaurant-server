export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  to_location_id: {
    type: 'La ubicación de destino debe ser un texto válido',
    nonEmpty: 'La ubicación de destino es obligatoria',
    uuid: 'La ubicación de destino debe ser un UUID válido',
  },
  idempotency_key: {
    type: 'La clave del pedido debe ser un texto válido',
    nonEmpty: 'La clave del pedido es obligatoria',
    uuid: 'La clave del pedido debe ser un UUID válido',
  },
  items: {
    type: 'La lista de productos no es válida',
    nonEmpty: 'Debe enviar al menos un producto',
    unique: 'No se puede repetir un producto',
  },
  product_id: {
    type: 'El ID del producto debe ser un texto válido',
    nonEmpty: 'El ID del producto es obligatorio',
    uuid: 'El ID del producto debe ser un UUID válido',
  },
  requested_qty: {
    type: 'La cantidad solicitada debe ser un texto válido',
    nonEmpty: 'La cantidad solicitada es obligatoria',
    integer: 'La cantidad solicitada debe ser un número entero',
    minValue: 'La cantidad solicitada debe ser al menos 1',
    maxValue: 'La cantidad solicitada es demasiado grande',
  },
  status: {
    type: 'Los estados deben ser una lista válida',
    itemEnum: 'Uno de los estados no es válido',
  },
  created_from: {
    type: 'La fecha inicial debe ser un texto válido',
    date: 'La fecha inicial no es válida',
  },
  created_to: {
    type: 'La fecha final debe ser un texto válido',
    date: 'La fecha final no es válida',
  },
  created_range: {
    order: 'La fecha inicial no puede ser posterior a la final',
  },
  from_location_id: {
    type: 'La ubicación de origen debe ser un texto válido',
    uuid: 'La ubicación de origen debe ser un UUID válido',
  },
  location_id: {
    type: 'La ubicación de destino debe ser un texto válido',
    uuid: 'La ubicación de destino debe ser un UUID válido',
  },
  note: {
    type: 'La nota debe ser un texto válido',
    nonEmpty: 'La nota no puede estar vacía',
    maxLength: 'La nota no puede superar los 500 caracteres',
  },
  item_id: {
    type: 'El producto del pedido debe ser un texto válido',
    nonEmpty: 'El producto del pedido es obligatorio',
    uuid: 'El producto del pedido debe ser un UUID válido',
  },
  quantity: {
    type: 'La cantidad debe ser un texto válido',
    nonEmpty: 'La cantidad es obligatoria',
    integer: 'La cantidad debe ser un número entero de 0 o más',
    maxValue: 'La cantidad es demasiado grande',
  },
  issue_note: {
    type: 'La nota del producto debe ser un texto válido',
    nonEmpty: 'La nota del producto no puede estar vacía',
    maxLength: 'La nota del producto no puede superar los 500 caracteres',
  },
});
