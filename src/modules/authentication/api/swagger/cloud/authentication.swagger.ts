//Api
import { API_AUTHENTICATION_MESSAGE } from '../../messages';

//Application
import { LoginBodyDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const AUTHENTICATION_CLOUD_LOGIN_DOCS: THttpDocs = {
  summary: 'Iniciar sesión',
  description:
    'Login del gerente contra la nube. Según la cuenta pide el código de MFA o el cambio de contraseña; cuando termina responde access: { session_token: mss_... }. Los tokens de la nube se quedan cifrados en el servidor.',
  cloud: true,
  body: LoginBodyDto,
  success: [
    API_AUTHENTICATION_MESSAGE.SUCCESS.LOGIN,
    API_AUTHENTICATION_MESSAGE.SUCCESS.MFA_REQUIRED,
    API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_RESET_REQUIRED,
  ],
};
