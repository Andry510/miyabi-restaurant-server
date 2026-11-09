import { HttpStatus } from '@nestjs/common';

//Api
import { API_TIP_MESSAGE } from '../../messages';

//Application
import {
  PoolSanctionBodyDto,
  PoolSanctionParamDto,
  SanctionTypeBodyDto,
  TipParamDto,
  UpdateSanctionTypeBodyDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const TIP_LOCAL_SANCTION_TYPES_DOCS: THttpDocs = {
  summary: 'Listar tipos de sanción',
  access: 'manager',
  success: API_TIP_MESSAGE.SUCCESS.SANCTION_TYPES_RETRIEVED,
};

export const TIP_LOCAL_SANCTION_CREATE_TYPE_DOCS: THttpDocs = {
  summary: 'Crear tipo de sanción',
  access: 'manager',
  body: SanctionTypeBodyDto,
  status: HttpStatus.CREATED,
  success: API_TIP_MESSAGE.SUCCESS.SANCTION_TYPE_CREATED,
  errors: [
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.SANCTION_TYPE_DUPLICATED,
    },
  ],
};

export const TIP_LOCAL_SANCTION_UPDATE_TYPE_DOCS: THttpDocs = {
  summary: 'Editar tipo de sanción',
  access: 'manager',
  params: TipParamDto,
  body: UpdateSanctionTypeBodyDto,
  success: API_TIP_MESSAGE.SUCCESS.SANCTION_TYPE_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.SANCTION_TYPE_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.SANCTION_TYPE_DUPLICATED,
    },
  ],
};

export const TIP_LOCAL_SANCTION_REMOVE_TYPE_DOCS: THttpDocs = {
  summary: 'Eliminar tipo de sanción (si no se ha usado)',
  access: 'manager',
  params: TipParamDto,
  success: API_TIP_MESSAGE.SUCCESS.SANCTION_TYPE_DELETED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.SANCTION_TYPE_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.SANCTION_TYPE_IN_USE,
    },
  ],
};

export const TIP_LOCAL_SANCTION_ADD_DOCS: THttpDocs = {
  summary: 'Sancionar a un empleado en la bolsa',
  access: 'manager',
  params: TipParamDto,
  body: PoolSanctionBodyDto,
  status: HttpStatus.CREATED,
  success: API_TIP_MESSAGE.SUCCESS.SANCTION_ADDED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.SANCTION_TYPE_NOT_FOUND,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.USER_NOT_IN_POOL,
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

export const TIP_LOCAL_SANCTION_REMOVE_DOCS: THttpDocs = {
  summary: 'Quitar una sanción',
  access: 'manager',
  params: PoolSanctionParamDto,
  success: API_TIP_MESSAGE.SUCCESS.SANCTION_REMOVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.SANCTION_NOT_FOUND,
    },
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
