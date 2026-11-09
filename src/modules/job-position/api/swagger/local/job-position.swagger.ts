import { HttpStatus } from '@nestjs/common';

//Api
import { API_JOB_POSITION_MESSAGE } from '../../messages';

//Application
import {
  JobPositionParamDto,
  JobPositionsQueryDto,
  RegisterDto,
  UpdateBodyDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const JOB_POSITION_LOCAL_JOB_POSITIONS_DOCS: THttpDocs = {
  summary: 'Listar puestos',
  access: 'manager',
  query: JobPositionsQueryDto,
  success: API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITIONS_RETRIEVED,
  data: 'pagination',
};

export const JOB_POSITION_LOCAL_REGISTER_DOCS: THttpDocs = {
  summary: 'Crear puesto',
  access: 'manager',
  body: RegisterDto,
  status: HttpStatus.CREATED,
  success: API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITION_CREATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_JOB_POSITION_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_JOB_POSITION_MESSAGE.ERROR.NAME_ALREADY_IN_USE,
    },
  ],
};

export const JOB_POSITION_LOCAL_JOB_POSITION_DOCS: THttpDocs = {
  summary: 'Ver puesto',
  access: 'manager',
  params: JobPositionParamDto,
  success: API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITION_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
    },
  ],
};

export const JOB_POSITION_LOCAL_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar puesto',
  access: 'manager',
  params: JobPositionParamDto,
  body: UpdateBodyDto,
  success: API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITION_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_JOB_POSITION_MESSAGE.ERROR.NAME_ALREADY_IN_USE,
    },
  ],
};

export const JOB_POSITION_LOCAL_REMOVE_DOCS: THttpDocs = {
  summary: 'Eliminar puesto',
  access: 'manager',
  params: JobPositionParamDto,
  success: API_JOB_POSITION_MESSAGE.SUCCESS.JOB_POSITION_DELETED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_JOB_POSITION_MESSAGE.ERROR.HAS_EMPLOYEES,
    },
  ],
};
