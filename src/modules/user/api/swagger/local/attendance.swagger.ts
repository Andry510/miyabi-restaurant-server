import { HttpStatus } from '@nestjs/common';

//Api
import { API_USER_MESSAGE } from '../../messages';

//Application
import { AttendanceQueryDto, UserParamDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const USER_LOCAL_ATTENDANCE_ATTENDANCE_DOCS: THttpDocs = {
  summary: 'Asistencia de un empleado',
  access: 'manager',
  params: UserParamDto,
  query: AttendanceQueryDto,
  success: API_USER_MESSAGE.SUCCESS.ATTENDANCE_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_USER_MESSAGE.ERROR.USER_NOT_EXIST,
    },
  ],
};

export const USER_LOCAL_ATTENDANCE_MY_ATTENDANCE_DOCS: THttpDocs = {
  summary: 'Mi asistencia',
  access: 'employee',
  query: AttendanceQueryDto,
  success: API_USER_MESSAGE.SUCCESS.ATTENDANCE_RETRIEVED,
};
