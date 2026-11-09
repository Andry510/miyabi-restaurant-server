import { HttpStatus } from '@nestjs/common';

//Api
import { API_USER_MESSAGE } from '../../messages';

//Application
import {
  RegisterDto,
  UpdateBodyDto,
  UserParamDto,
  UsersQueryDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const USER_LOCAL_USERS_DOCS: THttpDocs = {
  summary: 'Listar empleados',
  access: 'manager',
  query: UsersQueryDto,
  success: API_USER_MESSAGE.SUCCESS.USERS_RETRIEVED,
  data: 'pagination',
};

export const USER_LOCAL_REGISTER_DOCS: THttpDocs = {
  summary: 'Crear empleado',
  access: 'manager',
  body: RegisterDto,
  status: HttpStatus.CREATED,
  success: API_USER_MESSAGE.SUCCESS.USER_CREATED,
  data: 'file',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.AREA_JOB_POSITION_NOT_EXIST,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_USER_MESSAGE.ERROR.EMAIL_ALREADY_IN_USE,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_USER_MESSAGE.ERROR.PHONE_NUMBER_ALREADY_IN_USE,
    },
  ],
};

export const USER_LOCAL_USER_DOCS: THttpDocs = {
  summary: 'Ver empleado',
  access: 'manager',
  params: UserParamDto,
  success: API_USER_MESSAGE.SUCCESS.USER_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
    },
  ],
};

export const USER_LOCAL_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar empleado',
  access: 'manager',
  params: UserParamDto,
  body: UpdateBodyDto,
  success: API_USER_MESSAGE.SUCCESS.USER_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.AREA_JOB_POSITION_NOT_EXIST,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_USER_MESSAGE.ERROR.EMAIL_ALREADY_IN_USE,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_USER_MESSAGE.ERROR.PHONE_NUMBER_ALREADY_IN_USE,
    },
  ],
};

export const USER_LOCAL_RESET_PASSWORD_DOCS: THttpDocs = {
  summary: 'Contraseña temporal con Excel',
  access: 'manager',
  params: UserParamDto,
  success: API_USER_MESSAGE.SUCCESS.PASSWORD_RESET,
  data: 'file',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
    },
  ],
};

export const USER_LOCAL_REMOVE_DOCS: THttpDocs = {
  summary: 'Eliminar empleado',
  access: 'manager',
  params: UserParamDto,
  success: API_USER_MESSAGE.SUCCESS.USER_DELETED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
    },
  ],
};
