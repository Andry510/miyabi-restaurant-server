import { HttpStatus } from '@nestjs/common';

//Api
import { API_CHECK_MESSAGE } from '../../messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const CHECK_LOCAL_CURRENT_DOCS: THttpDocs = {
  summary: 'Asistencia actual',
  access: 'employee',
  success: API_CHECK_MESSAGE.SUCCESS.CURRENT_RETRIEVED,
};

export const CHECK_LOCAL_CHECK_IN_DOCS: THttpDocs = {
  summary: 'Registrar entrada',
  access: 'employee',
  status: HttpStatus.CREATED,
  success: API_CHECK_MESSAGE.SUCCESS.CHECKED_IN,
  errors: [
    { status: HttpStatus.NOT_FOUND, message: API_CHECK_MESSAGE.ERROR.NO_SHIFT },
    {
      status: HttpStatus.CONFLICT,
      message: API_CHECK_MESSAGE.ERROR.ALREADY_CHECKED_IN,
    },
    { status: HttpStatus.CONFLICT, message: API_CHECK_MESSAGE.ERROR.TOO_EARLY },
  ],
};

export const CHECK_LOCAL_CHECK_OUT_DOCS: THttpDocs = {
  summary: 'Registrar salida',
  access: 'employee',
  success: API_CHECK_MESSAGE.SUCCESS.CHECKED_OUT,
  errors: [
    {
      status: HttpStatus.CONFLICT,
      message: API_CHECK_MESSAGE.ERROR.NOT_CHECKED_IN,
    },
  ],
};
