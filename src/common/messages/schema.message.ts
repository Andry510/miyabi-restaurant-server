export const SCHEMA_MESSAGES = Object.freeze({
  ERROR: {
    PAGINATION: {
      PAGE_TYPE: 'La página debe ser un número válido.',
      PAGE_NUMBER: 'La página debe ser un número entero.',
      PAGE_MIN: 'La página debe ser mayor o igual a 1.',
      LIMIT_TYPE: 'El límite debe ser un número válido.',
      LIMIT_NUMBER: 'El límite debe ser un número entero.',
      LIMIT_MIN: 'El límite debe ser mayor o igual a 1.',
    },
    USER_ID: {
      TYPE: 'El usuario debe ser un texto válido.',
      REQUIRED: 'El usuario es obligatorio.',
      UUID: 'El usuario debe ser un UUID válido.',
    },
  },
});
