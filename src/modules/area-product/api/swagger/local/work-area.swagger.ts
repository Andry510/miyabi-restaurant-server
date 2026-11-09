import { HttpStatus } from '@nestjs/common';

//Api
import { API_AREA_PRODUCT_MESSAGE } from '../../messages';

//Application
import {
  LinkParamDto,
  LinksQueryDto,
  ProductsIdsBodyDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const AREA_PRODUCT_LOCAL_WORK_AREA_PRODUCTS_DOCS: THttpDocs = {
  summary: 'Productos de un área',
  access: 'manager',
  params: LinkParamDto,
  query: LinksQueryDto,
  success: API_AREA_PRODUCT_MESSAGE.SUCCESS.PRODUCTS_RETRIEVED,
  data: 'pagination',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
  ],
};

export const AREA_PRODUCT_LOCAL_WORK_AREA_ASSIGN_DOCS: THttpDocs = {
  summary: 'Vincular productos y áreas',
  access: 'manager',
  params: LinkParamDto,
  body: ProductsIdsBodyDto,
  success: API_AREA_PRODUCT_MESSAGE.SUCCESS.LINKED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.PRODUCT_NOT_FOUND,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
  ],
};

export const AREA_PRODUCT_LOCAL_WORK_AREA_REMOVE_DOCS: THttpDocs = {
  summary: 'Desvincular productos y áreas',
  access: 'manager',
  params: LinkParamDto,
  body: ProductsIdsBodyDto,
  success: API_AREA_PRODUCT_MESSAGE.SUCCESS.UNLINKED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.NOT_LINKED,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_AREA_PRODUCT_MESSAGE.ERROR.WORK_AREA_NOT_FOUND,
    },
  ],
};
