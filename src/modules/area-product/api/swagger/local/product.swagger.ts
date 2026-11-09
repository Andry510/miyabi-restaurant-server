import { HttpStatus } from '@nestjs/common';

//Api
import { API_AREA_PRODUCT_MESSAGE } from '../../messages';

//Application
import {
  LinkParamDto,
  LinksQueryDto,
  WorkAreasIdsBodyDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const AREA_PRODUCT_LOCAL_PRODUCT_WORK_AREAS_DOCS: THttpDocs = {
  summary: 'Áreas de un producto',
  access: 'manager',
  params: LinkParamDto,
  query: LinksQueryDto,
  success: API_AREA_PRODUCT_MESSAGE.SUCCESS.WORK_AREAS_RETRIEVED,
  data: 'pagination',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.PRODUCT_NOT_FOUND,
    },
  ],
};

export const AREA_PRODUCT_LOCAL_PRODUCT_ASSIGN_DOCS: THttpDocs = {
  summary: 'Vincular productos y áreas',
  access: 'manager',
  params: LinkParamDto,
  body: WorkAreasIdsBodyDto,
  success: API_AREA_PRODUCT_MESSAGE.SUCCESS.LINKED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.PRODUCT_NOT_FOUND,
    },
  ],
};

export const AREA_PRODUCT_LOCAL_PRODUCT_REMOVE_DOCS: THttpDocs = {
  summary: 'Desvincular productos y áreas',
  access: 'manager',
  params: LinkParamDto,
  body: WorkAreasIdsBodyDto,
  success: API_AREA_PRODUCT_MESSAGE.SUCCESS.UNLINKED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.NOT_LINKED,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.PRODUCT_NOT_FOUND,
    },
  ],
};
