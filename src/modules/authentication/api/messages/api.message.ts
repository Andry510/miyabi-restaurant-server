export const API_AUTHENTICATION_MESSAGE = Object.freeze({
  ERROR: {
    INVALID_CREDENTIALS: {
      code: 'ERROR_AUTHENTICATION_INVALID_CREDENTIALS',
      message: 'El correo o la contraseña no son correctos',
    },
    MFA_TOKEN_REQUIRED: {
      code: 'ERROR_MFA_MFA_TOKEN_REQUIRED',
      message: 'Falta el token de verificación en dos pasos',
    },
    PASSWORD_TOKEN_REQUIRED: {
      code: 'ERROR_PASSWORD_PASSWORD_TOKEN_REQUIRED',
      message: 'Falta el token para cambiar la contraseña',
    },
    PASSWORD_TOKEN_EXPIRED: {
      code: 'ERROR_PASSWORD_PASSWORD_TOKEN_EXPIRED',
      message:
        'El tiempo para cambiar la contraseña expiró, inicia sesión de nuevo',
    },
  },
  SUCCESS: {
    LOGIN: {
      code: 'SUCCESS_AUTHENTICATION_LOGIN',
      message: 'Sesión iniciada correctamente',
    },
    MFA_REQUIRED: {
      code: 'SUCCESS_AUTHENTICATION_MFA_REQUIRED',
      message: 'Ingresa el código de verificación para continuar',
    },
    PASSWORD_RESET_REQUIRED: {
      code: 'SUCCESS_AUTHENTICATION_PASSWORD_RESET_REQUIRED',
      message: 'Debes crear una contraseña nueva para continuar',
    },
    QR_RETRIEVED: {
      code: 'SUCCESS_MFA_QR_RETRIEVED',
      message: 'Escanea el código QR con tu aplicación de autenticación',
    },
    PASSWORD_UPDATED: {
      code: 'SUCCESS_PASSWORD_PASSWORD_UPDATED',
      message: 'Contraseña actualizada correctamente',
    },
  },
});
