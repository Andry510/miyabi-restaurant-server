import { HttpStatus } from '@nestjs/common';

//Api
import { API_ME_MESSAGE } from '../../messages';

//Application
import {
  ChangePasswordBodyDto,
  UpdateProfileBodyDto,
} from '../../../application/dto';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const ME_LOCAL_USER_USER_DOCS: THttpDocs = {
  summary: 'Mi perfil',
  access: 'employee',
  success: API_ME_MESSAGE.SUCCESS.USER_RETRIEVED,
};

export const ME_LOCAL_USER_UPDATE_PROFILE_DOCS: THttpDocs = {
  summary: 'Cambiar mi teléfono',
  access: 'employee',
  body: UpdateProfileBodyDto,
  success: API_ME_MESSAGE.SUCCESS.PROFILE_UPDATED,
  errors: [
    {
      status: HttpStatus.CONFLICT,
      message: API_ME_MESSAGE.ERROR.PHONE_NUMBER_ALREADY_IN_USE,
    },
  ],
};

export const ME_LOCAL_USER_CHANGE_PASSWORD_DOCS: THttpDocs = {
  summary: 'Cambiar mi contraseña (cierra la sesión)',
  access: 'employee',
  body: ChangePasswordBodyDto,
  success: API_ME_MESSAGE.SUCCESS.PASSWORD_CHANGED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_ME_MESSAGE.ERROR.INVALID_CURRENT_PASSWORD,
    },
    {
      status: HttpStatus.UNAUTHORIZED,
      message: API_MESSAGE_GLOBAL.ERROR.UNAUTHORIZED,
    },
  ],
};
