export const SWAGGER_CONFIG = Object.freeze({
  PATH: 'document',
  TITLE: 'Miyabi Restaurant Server',
  DESCRIPTION:
    'REST del servidor local del restaurante (/v1) para la app del local. Los empleados usan el access_token del servidor; los gerentes, el session_token (mss_...). Las rutas */cloud pasan por la nube. Cada respuesta trae un code estable; el message es texto en español.',
  VERSION: '1.0',
});
