import { HttpStatus } from '@nestjs/common';

//Api
import { API_SESSION_MESSAGE } from '../../messages';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SESSION_LOCAL_REFRESH_TOKEN_DOCS: THttpDocs = {
  summary: 'Renovar la sesión',
  bearer: true,
  success: API_SESSION_MESSAGE.SUCCESS.TOKEN_UPDATED,
  errors: [
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.MISSING_REFRESH_TOKEN,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.INVALID_REFRESH_TOKEN,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.UNAUTHORIZED,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.EXPIRED_REFRESH_TOKEN,
    },
  ],
};

export const SESSION_LOCAL_LOGOUT_DOCS: THttpDocs = {
  summary: 'Cerrar sesión',
  bearer: true,
  success: API_SESSION_MESSAGE.SUCCESS.SESSION_LOGGED_OUT,
  data: 'none',
  errors: [
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.MISSING_REFRESH_TOKEN,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.INVALID_REFRESH_TOKEN,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.UNAUTHORIZED,
    },
  ],
};
