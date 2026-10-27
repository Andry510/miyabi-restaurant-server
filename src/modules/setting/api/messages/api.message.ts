export const API_SETTING_MESSAGE = Object.freeze({
  ERROR: {
    TIP_POOLS_OPEN: {
      code: 'ERROR_SETTING_TIP_POOLS_OPEN',
      message: 'No se puede cambiar mientras haya bolsas de propinas abiertas',
    },
  },
  SUCCESS: {
    SETTINGS_RETRIEVED: {
      code: 'SUCCESS_SETTINGS_RETRIEVED',
      message: 'Configuración obtenida correctamente',
    },
    SETTINGS_UPDATED: {
      code: 'SUCCESS_SETTINGS_UPDATED',
      message: 'Configuración actualizada correctamente',
    },
  },
});
