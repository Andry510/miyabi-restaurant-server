import { HttpStatus } from '@nestjs/common';

//Api
import { API_SESSION_MESSAGE } from '../../messages';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SESSION_CLOUD_LOGOUT_DOCS: THttpDocs = {
  summary:
    'Cerrar la sesión del gerente (Bearer mss_...): la cierra en la nube, la borra y desconecta su socket',
  description:
    'Con el session_token (Bearer mss_...). Cierra la sesión en la nube, la borra en el local y desconecta su socket.',
  cloud: true,
  success: API_SESSION_MESSAGE.SUCCESS.SESSION_LOGGED_OUT,
  data: 'none',
  errors: [
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_INVALID,
    },
  ],
};
