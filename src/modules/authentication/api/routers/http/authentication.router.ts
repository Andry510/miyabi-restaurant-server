export const HTTP_AUTHENTICATION_ROUTER = Object.freeze({
  AUTHENTICATION: {
    LOGIN: 'authentication/cloud/login',
  },
  MFA: {
    QR: 'authentication/cloud/mfa/qr',
    CODE: 'authentication/cloud/mfa/code',
  },
  PASSWORD: {
    RESET: 'authentication/cloud/password/reset',
  },
  LOCAL: {
    LOGIN: 'authentication/local/login',
    PASSWORD_RESET: 'authentication/local/password/reset',
  },
});
