import { HttpStatus } from '@nestjs/common';

//Api
import { API_SHIFT_MESSAGE } from '../../messages';

//Application
import {
  CorrectAttendanceBodyDto,
  JustifyBodyDto,
  ShiftParamDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SHIFT_LOCAL_ATTENDANCE_CORRECT_DOCS: THttpDocs = {
  summary: 'Corregir hora de entrada o salida',
  access: 'manager',
  params: ShiftParamDto,
  body: CorrectAttendanceBodyDto,
  success: API_SHIFT_MESSAGE.SUCCESS.ATTENDANCE_CORRECTED,
  errors: [
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_SHIFT_MESSAGE.ERROR.CLOCK_IN_REQUIRED,
    },
    {
      status: HttpStatus.BAD_REQUEST,
      message: API_SHIFT_MESSAGE.ERROR.INVALID_TIMES,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.NOT_STARTED,
    },
    { status: HttpStatus.CONFLICT, message: API_SHIFT_MESSAGE.ERROR.CANCELLED },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.TIP_POOL_CLOSED,
    },
  ],
};

export const SHIFT_LOCAL_ATTENDANCE_JUSTIFY_DOCS: THttpDocs = {
  summary: 'Justificar falta, retardo o salida temprana',
  access: 'manager',
  params: ShiftParamDto,
  body: JustifyBodyDto,
  success: API_SHIFT_MESSAGE.SUCCESS.JUSTIFIED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_SHIFT_MESSAGE.ERROR.SHIFT_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.ALREADY_JUSTIFIED,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.NOT_FINISHED,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.NOT_ABSENT,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.NO_INCIDENT,
    },
    { status: HttpStatus.CONFLICT, message: API_SHIFT_MESSAGE.ERROR.CANCELLED },
    {
      status: HttpStatus.CONFLICT,
      message: API_SHIFT_MESSAGE.ERROR.TIP_POOL_CLOSED,
    },
  ],
};
