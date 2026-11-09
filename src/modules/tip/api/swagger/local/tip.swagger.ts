import { HttpStatus } from '@nestjs/common';

//Api
import { API_TIP_MESSAGE } from '../../messages';
import { API_WORK_SCHEDULE_MESSAGE } from '../../../../work-schedule/api/messages';

//Application
import {
  PoolsQueryDto,
  RegisterDto,
  TipParamDto,
  UpdateBodyDto,
} from '../../../application/dto';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const TIP_LOCAL_POOLS_DOCS: THttpDocs = {
  summary: 'Listar bolsas de propinas',
  access: 'manager',
  query: PoolsQueryDto,
  success: API_TIP_MESSAGE.SUCCESS.POOLS_RETRIEVED,
  data: 'pagination',
};

export const TIP_LOCAL_REGISTER_DOCS: THttpDocs = {
  summary: 'Crear bolsa de propinas',
  access: 'manager',
  body: RegisterDto,
  status: HttpStatus.CREATED,
  success: API_TIP_MESSAGE.SUCCESS.POOL_CREATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.PERIOD_MISMATCH,
    },
    { status: HttpStatus.CONFLICT, message: API_TIP_MESSAGE.ERROR.OVERLAP },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.RULES_INCOMPLETE,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN,
    },
    { status: HttpStatus.CONFLICT, message: API_TIP_MESSAGE.ERROR.SHIFT_TAKEN },
  ],
};

export const TIP_LOCAL_POOL_DOCS: THttpDocs = {
  summary: 'Ver bolsa de propinas',
  access: 'manager',
  params: TipParamDto,
  success: API_TIP_MESSAGE.SUCCESS.POOL_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
  ],
};

export const TIP_LOCAL_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar reglas de propinas',
  access: 'manager',
  params: TipParamDto,
  body: UpdateBodyDto,
  success: API_TIP_MESSAGE.SUCCESS.POOL_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.RULES_INCOMPLETE,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.NO_PARTICIPANTS,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.MANUAL_MISMATCH,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.PENDING_SHIFTS,
    },
    { status: HttpStatus.CONFLICT, message: API_TIP_MESSAGE.ERROR.SHIFT_TAKEN },
  ],
};

export const TIP_LOCAL_CLOSE_DOCS: THttpDocs = {
  summary: 'Cerrar bolsa de propinas',
  access: 'manager',
  params: TipParamDto,
  success: API_TIP_MESSAGE.SUCCESS.POOL_CLOSED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.RULES_INCOMPLETE,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.NO_PARTICIPANTS,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.MANUAL_MISMATCH,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.PENDING_SHIFTS,
    },
    { status: HttpStatus.CONFLICT, message: API_TIP_MESSAGE.ERROR.SHIFT_TAKEN },
  ],
};

export const TIP_LOCAL_REOPEN_DOCS: THttpDocs = {
  summary: 'Reabrir bolsa de propinas',
  access: 'manager',
  params: TipParamDto,
  success: API_TIP_MESSAGE.SUCCESS.POOL_REOPENED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
    { status: HttpStatus.CONFLICT, message: API_MESSAGE_GLOBAL.ERROR.CONFLICT },
  ],
};

export const TIP_LOCAL_REMOVE_DOCS: THttpDocs = {
  summary: 'Eliminar bolsa de propinas',
  access: 'manager',
  params: TipParamDto,
  success: API_TIP_MESSAGE.SUCCESS.POOL_DELETED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
    { status: HttpStatus.CONFLICT, message: API_MESSAGE_GLOBAL.ERROR.CONFLICT },
  ],
};
