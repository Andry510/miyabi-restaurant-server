import { HttpStatus } from '@nestjs/common';

//Api
import { API_WORK_SCHEDULE_MESSAGE } from '../../messages';

//Application
import {
  RegisterDto,
  UpdateBodyDto,
  WorkScheduleParamDto,
  WorkSchedulesQueryDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const WORK_SCHEDULE_LOCAL_WORK_SCHEDULES_DOCS: THttpDocs = {
  summary: 'Listar horarios',
  access: 'manager',
  query: WorkSchedulesQueryDto,
  success: API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULES_RETRIEVED,
  data: 'pagination',
};

export const WORK_SCHEDULE_LOCAL_REGISTER_DOCS: THttpDocs = {
  summary: 'Crear horario',
  access: 'manager',
  body: RegisterDto,
  status: HttpStatus.CREATED,
  success: API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULE_CREATED,
};

export const WORK_SCHEDULE_LOCAL_WORK_SCHEDULE_DOCS: THttpDocs = {
  summary: 'Ver horario',
  access: 'manager',
  params: WorkScheduleParamDto,
  success: API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULE_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
    },
  ],
};

export const WORK_SCHEDULE_LOCAL_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar horario',
  access: 'manager',
  params: WorkScheduleParamDto,
  body: UpdateBodyDto,
  success: API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULE_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
    },
  ],
};

export const WORK_SCHEDULE_LOCAL_REMOVE_DOCS: THttpDocs = {
  summary: 'Eliminar horario',
  access: 'manager',
  params: WorkScheduleParamDto,
  success: API_WORK_SCHEDULE_MESSAGE.SUCCESS.WORK_SCHEDULE_DELETED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_SCHEDULE_MESSAGE.ERROR.WORK_SCHEDULE_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_WORK_SCHEDULE_MESSAGE.ERROR.HAS_SCHEDULED_SHIFTS,
    },
  ],
};
