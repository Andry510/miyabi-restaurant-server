import { HttpStatus } from '@nestjs/common';

//Api
import { API_AUTHENTICATION_MESSAGE } from '../../messages';

//Application
import { MfaCodeBodyDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const AUTHENTICATION_CLOUD_MFA_QR_DOCS: THttpDocs = {
  summary: 'Obtener el QR de MFA',
  bearer: true,
  cloud: true,
  success: API_AUTHENTICATION_MESSAGE.SUCCESS.QR_RETRIEVED,
  errors: [
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_AUTHENTICATION_MESSAGE.ERROR.MFA_TOKEN_REQUIRED,
    },
  ],
};

export const AUTHENTICATION_CLOUD_MFA_CODE_DOCS: THttpDocs = {
  summary: 'Verificar el código de MFA',
  description:
    'Con el mfa_token (Bearer). Si termina, responde access: { session_token: mss_... }.',
  bearer: true,
  cloud: true,
  body: MfaCodeBodyDto,
  success: [
    API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_RESET_REQUIRED,
    API_AUTHENTICATION_MESSAGE.SUCCESS.LOGIN,
  ],
  errors: [
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_AUTHENTICATION_MESSAGE.ERROR.MFA_TOKEN_REQUIRED,
    },
  ],
};
