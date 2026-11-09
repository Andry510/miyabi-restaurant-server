import { HttpStatus } from '@nestjs/common';

//Api
import { API_USER_MESSAGE } from '../../messages';

//Application
import { SessionsQueryDto, UserParamDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const USER_LOCAL_SESSION_SESSIONS_DOCS: THttpDocs = {
  summary: 'Sesiones de un empleado',
  access: 'manager',
  params: UserParamDto,
  query: SessionsQueryDto,
  success: API_USER_MESSAGE.SUCCESS.SESSIONS_RETRIEVED,
  data: 'pagination',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
    },
  ],
};

export const USER_LOCAL_SESSION_REVOKE_DOCS: THttpDocs = {
  summary: 'Cerrar la sesión activa de un empleado',
  access: 'manager',
  params: UserParamDto,
  success: API_USER_MESSAGE.SUCCESS.SESSION_REVOKED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.NO_ACTIVE_SESSION,
    },
  ],
};
