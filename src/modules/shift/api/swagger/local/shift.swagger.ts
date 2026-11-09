import { HttpStatus } from '@nestjs/common';

//Api
import { API_SHIFT_MESSAGE } from '../../messages';
import { API_WORK_SCHEDULE_MESSAGE } from '../../../../work-schedule/api/messages';

//Application
import {
  RegisterDto,
  ShiftParamDto,
  ShiftsQueryDto,
  UpdateBodyDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SHIFT_LOCAL_SHIFTS_DOCS: THttpDocs = {
  summary: 'Listar turnos',
  access: 'manager',
  query: ShiftsQueryDto,
  success: API_SHIFT_MESSAGE.SUCCESS.SHIFTS_RETRIEVED,
  data: 'pagination',
};

export const SHIFT_LOCAL_REGISTER_DOCS: THttpDocs = {
  summary: 'Programar turnos',
  access: 'manager',
  body: RegisterDto,
  status: HttpStatus.CREATED,
  success: API_SHIFT_MESSAGE.SUCCESS.SHIFTS_CREATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_SHIFT_MESSAGE.ERROR.USER_NOT_FOUND,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.USER_INACTIVE,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.USER_WITHOUT_ASSIGNMENT,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.WORK_SCHEDULE_INACTIVE,
    },
    { status: HttpStatus.CONFLICT, message: API_SHIFT_MESSAGE.ERROR.OVERLAP },
  ],
};

export const SHIFT_LOCAL_SHIFT_DOCS: THttpDocs = {
  summary: 'Ver turno',
  access: 'manager',
  params: ShiftParamDto,
  success: API_SHIFT_MESSAGE.SUCCESS.SHIFT_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
    },
  ],
};

export const SHIFT_LOCAL_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar turno',
  access: 'manager',
  params: ShiftParamDto,
  body: UpdateBodyDto,
  success: API_SHIFT_MESSAGE.SUCCESS.SHIFT_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.NOT_EDITABLE,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.WORK_SCHEDULE_INACTIVE,
    },
    { status: HttpStatus.CONFLICT, message: API_SHIFT_MESSAGE.ERROR.OVERLAP },
  ],
};

export const SHIFT_LOCAL_CANCEL_DOCS: THttpDocs = {
  summary: 'Cancelar turno',
  access: 'manager',
  params: ShiftParamDto,
  success: API_SHIFT_MESSAGE.SUCCESS.SHIFT_CANCELLED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.NOT_EDITABLE,
    },
  ],
};
