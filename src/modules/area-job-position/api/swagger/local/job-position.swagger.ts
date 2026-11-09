import { HttpStatus } from '@nestjs/common';

//Api
import { API_AREA_JOB_POSITION_MESSAGE } from '../../messages';

//Application
import {
  LinkParamDto,
  LinksQueryDto,
  WorkAreasIdsBodyDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const AREA_JOB_POSITION_LOCAL_JOB_POSITION_WORK_AREAS_DOCS: THttpDocs = {
  summary: 'Áreas de un puesto',
  access: 'manager',
  params: LinkParamDto,
  query: LinksQueryDto,
  success: API_AREA_JOB_POSITION_MESSAGE.SUCCESS.WORK_AREAS_RETRIEVED,
  data: 'pagination',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
    },
  ],
};

export const AREA_JOB_POSITION_LOCAL_JOB_POSITION_ASSIGN_DOCS: THttpDocs = {
  summary: 'Vincular puestos y áreas',
  access: 'manager',
  params: LinkParamDto,
  body: WorkAreasIdsBodyDto,
  success: API_AREA_JOB_POSITION_MESSAGE.SUCCESS.LINKED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_JOB_POSITION_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
    },
  ],
};

export const AREA_JOB_POSITION_LOCAL_JOB_POSITION_REMOVE_DOCS: THttpDocs = {
  summary: 'Desvincular puestos y áreas',
  access: 'manager',
  params: LinkParamDto,
  body: WorkAreasIdsBodyDto,
  success: API_AREA_JOB_POSITION_MESSAGE.SUCCESS.UNLINKED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_JOB_POSITION_MESSAGE.ERROR.NOT_LINKED,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_AREA_JOB_POSITION_MESSAGE.ERROR.HAS_EMPLOYEES,
    },
  ],
};

export const AREA_JOB_POSITION_LOCAL_JOB_POSITION_USERS_DOCS: THttpDocs = {
  summary: 'Empleados con un puesto o en un área',
  access: 'manager',
  params: LinkParamDto,
  query: LinksQueryDto,
  success: API_AREA_JOB_POSITION_MESSAGE.SUCCESS.USERS_RETRIEVED,
  data: 'pagination',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_JOB_POSITION_MESSAGE.ERROR.JOB_POSITION_NOT_FOUND,
    },
  ],
};
