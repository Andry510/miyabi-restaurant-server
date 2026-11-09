import { HttpStatus } from '@nestjs/common';

//Api
import { API_AUTHENTICATION_MESSAGE } from '../../messages';

//Application
import { LoginBodyDto, ResetPasswordBodyDto } from '../../../application/dto';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const AUTHENTICATION_LOCAL_LOGIN_DOCS: THttpDocs = {
  summary: 'Iniciar sesión',
  body: LoginBodyDto,
  success: [
    API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_RESET_REQUIRED,
    API_AUTHENTICATION_MESSAGE.SUCCESS.LOGIN,
  ],
  errors: [
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_AUTHENTICATION_MESSAGE.ERROR.INVALID_CREDENTIALS,
    },
    {
      status: HttpStatus.FORBIDDEN,
      message: API_MESSAGE_GLOBAL.ERROR.ACCOUNT_DISABLED,
    },
  ],
};

export const AUTHENTICATION_LOCAL_RESET_PASSWORD_DOCS: THttpDocs = {
  summary: 'Cambiar la contraseña obligatoria',
  bearer: true,
  body: ResetPasswordBodyDto,
  success: API_AUTHENTICATION_MESSAGE.SUCCESS.PASSWORD_UPDATED,
  errors: [
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_AUTHENTICATION_MESSAGE.ERROR.PASSWORD_TOKEN_REQUIRED,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.INVALID_TOKEN,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_AUTHENTICATION_MESSAGE.ERROR.PASSWORD_TOKEN_EXPIRED,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_AUTHENTICATION_MESSAGE.ERROR.INVALID_CREDENTIALS,
    },
    {
      status: HttpStatus.FORBIDDEN,
      message: API_MESSAGE_GLOBAL.ERROR.ACCOUNT_DISABLED,
    },
    {
      status: HttpStatus.FORBIDDEN,
      message: API_MESSAGE_GLOBAL.ERROR.FORBIDDEN,
    },
  ],
};
