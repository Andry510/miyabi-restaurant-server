export const ERROR_MESSAGE_SCHEMA = Object.freeze({
  name: {
    type: 'El nombre del producto debe ser un texto válido',
  },
  barcode: {
    type: 'El código de barras debe ser un texto válido',
  },
  storage_code: {
    type: 'El código de almacenamiento debe ser un texto válido',
  },
  units: {
    type: 'Las unidades deben ser una lista válida',
    itemEnum: 'Una de las unidades de medida no es válida',
  },
  first_name: {
    type: 'El nombre debe ser un texto válido',
  },
  last_name: {
    type: 'El apellido debe ser un texto válido',
  },
  email: {
    type: 'El correo debe ser un texto válido',
  },
  phone_number: {
    type: 'El teléfono debe ser un texto válido',
  },
  supplier_id: {
    type: 'El ID del proveedor debe ser un texto válido',
    nonEmpty: 'El ID del proveedor es obligatorio',
    uuid: 'El ID del proveedor debe ser un UUID válido',
  },
  product_id: {
    type: 'El ID del producto debe ser un texto válido',
    nonEmpty: 'El ID del producto es obligatorio',
    uuid: 'El ID del producto debe ser un UUID válido',
  },
});
