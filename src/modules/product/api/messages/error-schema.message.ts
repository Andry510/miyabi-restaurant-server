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
});
