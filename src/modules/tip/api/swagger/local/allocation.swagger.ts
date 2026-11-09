import { HttpStatus } from '@nestjs/common';

//Api
import { API_TIP_MESSAGE } from '../../messages';

//Application
import {
  AreaBodyDto,
  AreaParamDto,
  AreaStatusBodyDto,
  MyTipsQueryDto,
  TipParamDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const TIP_LOCAL_ALLOCATION_MINE_DOCS: THttpDocs = {
  summary: 'Mis propinas',
  access: 'employee',
  query: MyTipsQueryDto,
  success: API_TIP_MESSAGE.SUCCESS.MY_TIPS_RETRIEVED,
};

export const TIP_LOCAL_ALLOCATION_RESET_AREA_DOCS: THttpDocs = {
  summary: 'Restablecer reparto de un área',
  access: 'manager',
  params: AreaParamDto,
  success: API_TIP_MESSAGE.SUCCESS.AREA_RESET,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.AREA_NOT_IN_POOL,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.RULES_INCOMPLETE,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN,
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

export const TIP_LOCAL_ALLOCATION_AREA_DOCS: THttpDocs = {
  summary: 'Repartir la propina de un área',
  access: 'manager',
  params: AreaParamDto,
  body: AreaBodyDto,
  success: API_TIP_MESSAGE.SUCCESS.AREA_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.AREA_NOT_IN_POOL,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.USER_NOT_IN_AREA,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.MANUAL_MISMATCH,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_OPEN,
    },
  ],
};

export const TIP_LOCAL_ALLOCATION_AREA_STATUS_DOCS: THttpDocs = {
  summary: 'Apagar o prender un área en la bolsa',
  access: 'manager',
  params: AreaParamDto,
  body: AreaStatusBodyDto,
  success: API_TIP_MESSAGE.SUCCESS.AREA_STATUS_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.AREA_NOT_IN_POOL,
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

export const TIP_LOCAL_ALLOCATION_EXPORT_DOCS: THttpDocs = {
  summary: 'Excel del reparto con columna de firma',
  access: 'manager',
  params: TipParamDto,
  success: API_TIP_MESSAGE.SUCCESS.POOL_EXPORTED,
  data: 'file',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_TIP_MESSAGE.ERROR.POOL_NOT_FOUND,
    },
  ],
};
