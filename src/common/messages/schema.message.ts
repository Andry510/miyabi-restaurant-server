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
    DATE_RANGE: {
      FROM_TYPE: 'La fecha inicial debe ser un texto válido.',
      FROM_DATE: 'La fecha inicial debe tener el formato AAAA-MM-DD.',
      TO_TYPE: 'La fecha final debe ser un texto válido.',
      TO_DATE: 'La fecha final debe tener el formato AAAA-MM-DD.',
      ORDER: 'La fecha final no puede ser anterior a la inicial.',
      MAX: 'El rango no puede ser mayor a 92 días.',
    },
    USER_ID: {
      TYPE: 'El usuario debe ser un texto válido.',
      REQUIRED: 'El usuario es obligatorio.',
      UUID: 'El usuario debe ser un UUID válido.',
    },
  },
});
