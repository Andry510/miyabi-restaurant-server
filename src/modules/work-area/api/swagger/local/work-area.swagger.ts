import { HttpStatus } from '@nestjs/common';

//Api
import { API_WORK_AREA_MESSAGE } from '../../messages';

//Application
import {
  RegisterDto,
  UpdateBodyDto,
  WorkAreaParamDto,
  WorkAreasQueryDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const WORK_AREA_LOCAL_WORK_AREAS_DOCS: THttpDocs = {
  summary: 'Listar áreas',
  access: 'manager',
  query: WorkAreasQueryDto,
  success: API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREAS_RETRIEVED,
  data: 'pagination',
};

export const WORK_AREA_LOCAL_REGISTER_DOCS: THttpDocs = {
  summary: 'Crear área',
  access: 'manager',
  body: RegisterDto,
  status: HttpStatus.CREATED,
  success: API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREA_CREATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_AREA_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_WORK_AREA_MESSAGE.ERROR.NAME_ALREADY_IN_USE,
    },
  ],
};

export const WORK_AREA_LOCAL_WORK_AREA_DOCS: THttpDocs = {
  summary: 'Ver área',
  access: 'manager',
  params: WorkAreaParamDto,
  success: API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREA_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_AREA_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
  ],
};

export const WORK_AREA_LOCAL_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar área',
  access: 'manager',
  params: WorkAreaParamDto,
  body: UpdateBodyDto,
  success: API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREA_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_AREA_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_WORK_AREA_MESSAGE.ERROR.NAME_ALREADY_IN_USE,
    },
  ],
};

export const WORK_AREA_LOCAL_REMOVE_DOCS: THttpDocs = {
  summary: 'Eliminar área',
  access: 'manager',
  params: WorkAreaParamDto,
  success: API_WORK_AREA_MESSAGE.SUCCESS.WORK_AREA_DELETED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_WORK_AREA_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_WORK_AREA_MESSAGE.ERROR.HAS_EMPLOYEES,
    },
  ],
};
