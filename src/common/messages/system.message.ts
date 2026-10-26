export const SYSTEM_MESSAGE = Object.freeze({
  ERROR: {
    INVALID_ENV_VARIABLE:
      'Las variables de entorno no son válidas o están incompletas.',
    DATABASE_CONNECTION_FAILED:
      'No se pudo establecer la conexión con la base de datos.',
    DATABASE_DISCONNECTION_FAILED:
      'No se pudo cerrar la conexión con la base de datos.',
    INVALID_RESULT_ENTITIES:
      'No se puede obtener el valor de una operación fallida.',
    SOCKET_NOT_PAIRED:
      'El servidor no está emparejado; el socket con la nube queda en espera.',
    SOCKET_DISCONNECTED: (reason: string) =>
      `Desconectado del socket de la nube: ${reason}.`,
    SOCKET_UNREACHABLE: (message: string) =>
      `No se pudo conectar al socket de la nube (${message}); se reintenta solo.`,
    SOCKET_REJECTED: (message: string) =>
      `La nube rechazó el server_token (${message}); el socket se detiene hasta emparejar de nuevo.`,
    SOCKET_RETRY: (message: string) =>
      `La nube no pudo validar la conexión (${message}); se reintenta en unos segundos.`,
    SOCKET_SESSION_EXPIRED: (reason: string) =>
      `La nube cerró la sesión del servidor (${reason}); el socket se detiene.`,
    SOCKET_HANDLER_FAILED: (event: string) =>
      `Falló el manejo del evento ${event}.`,
    IP_CHANGED: (ip: string) => `La dirección IP ha cambiado por ${ip}.`,
    INVALID_DEVICE_OR_BROWSER: 'El dispositivo o navegador no es válido.',
    HYDRATION_INVALID_PRODUCT:
      'La nube envió un producto que no cumple el formato esperado.',
  },
  SUCCESS: {
    DATABASE_CONNECTED: 'Conexión a la base de datos establecida exitosamente.',
    DATABASE_DISCONNECTED: 'Conexión a la base de datos cerrada correctamente.',
    SOCKET_CONNECTED: 'Conectado al socket de la nube.',
    HYDRATION_APPLIED: (saved: number, removed: number, skipped: number) =>
      `Hidratación aplicada: ${saved} guardados, ${removed} quitados, ${skipped} descartados por datos inválidos.`,
    PRODUCT_SAVED: (id: string) => `Producto guardado desde la nube: ${id}.`,
    PRODUCT_REMOVED: (id: string) => `Producto quitado desde la nube: ${id}.`,
  },
});
