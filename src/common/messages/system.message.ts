export const SYSTEM_MESSAGE = Object.freeze({
  ERROR: {
    INVALID_ENV_VARIABLE:
      'Las variables de entorno no son válidas o están incompletas.',
    DATABASE_CONNECTION_FAILED:
      'No se pudo establecer la conexión con la base de datos.',
    CACHE_CONNECTION_FAILED:
      'No se pudo conectar a Redis; el servidor sigue sin caché.',
    DATABASE_DISCONNECTION_FAILED:
      'No se pudo cerrar la conexión con la base de datos.',
    INVALID_RESULT_ENTITIES:
      'No se puede obtener el valor de una operación fallida.',
    CHANNEL_NOT_PAIRED:
      'El servidor no está emparejado; el canal con la nube queda en espera.',
    CHANNEL_UNREACHABLE: (message: string) =>
      `No se pudo abrir el canal con la nube (${message}); se reintenta solo.`,
    CHANNEL_REJECTED: (message: string) =>
      `La nube rechazó el server_token (${message}); el canal se detiene hasta emparejar de nuevo.`,
    CHANNEL_CLOSED: (reason: string) =>
      `La nube cerró el canal del servidor (${reason}).`,
    CHANNEL_HANDLER_FAILED: (event: string) =>
      `Falló el manejo del mensaje ${event}.`,
    CHANNEL_REQUEST_FAILED: (request: string) =>
      `Falló la respuesta a la solicitud ${request}.`,
    IP_CHANGED: (ip: string) => `La dirección IP ha cambiado por ${ip}.`,
    INVALID_DEVICE_OR_BROWSER: 'El dispositivo o navegador no es válido.',
    HYDRATION_INVALID_PRODUCT:
      'La nube envió un producto que no cumple el formato esperado.',
  },
  SUCCESS: {
    CACHE_CONNECTED: 'Conexión a Redis establecida exitosamente.',
    DATABASE_CONNECTED: 'Conexión a la base de datos establecida exitosamente.',
    DATABASE_DISCONNECTED: 'Conexión a la base de datos cerrada correctamente.',
    CHANNEL_CONNECTED: 'Canal con la nube abierto.',
    HYDRATION_APPLIED: (saved: number, removed: number, skipped: number) =>
      `Hidratación aplicada: ${saved} guardados, ${removed} quitados, ${skipped} descartados por datos inválidos.`,
    PRODUCT_SAVED: (id: string) => `Producto guardado desde la nube: ${id}.`,
    PRODUCT_REMOVED: (id: string) => `Producto quitado desde la nube: ${id}.`,
  },
});
