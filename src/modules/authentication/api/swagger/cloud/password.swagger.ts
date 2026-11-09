import { HttpStatus } from '@nestjs/common';

//Api
import { API_AUTHENTICATION_MESSAGE } from '../../messages';

//Application
import { ResetPasswordBodyDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const AUTHENTICATION_CLOUD_PASSWORD_RESET_DOCS: THttpDocs = {
  summary: 'Cambiar la contraseña obligatoria',
  description:
    'Con el password_reset_token (Bearer). Responde access: { session_token: mss_... }.',
  bearer: true,
  cloud: true,
  body: ResetPasswordBodyDto,
  success: API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_UPDATED,
  errors: [
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_AUTHENTICATION_MESSAGE.ERROR.PASSWORD_TOKEN_REQUIRED,
    },
  ],
};
