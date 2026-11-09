import { HttpStatus } from '@nestjs/common';

//Api
import { API_ORDER_MESSAGE } from '../../messages';

//Application
import {
  MineQueryDto,
  OrderParamDto,
  RequestBodyDto,
  UpdateRequestDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const ORDER_LOCAL_REQUEST_MINE_DOCS: THttpDocs = {
  summary: 'Mis solicitudes',
  access: 'employee',
  query: MineQueryDto,
  success: API_ORDER_MESSAGE.SUCCESS.MY_REQUESTS_RETRIEVED,
};

export const ORDER_LOCAL_REQUEST_SAVE_DOCS: THttpDocs = {
  summary: 'Crear solicitud de productos',
  access: 'employee',
  body: RequestBodyDto,
  status: HttpStatus.CREATED,
  success: API_ORDER_MESSAGE.SUCCESS.REQUEST_SAVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.PRODUCT_NOT_IN_AREA,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.WITHOUT_ASSIGNMENT,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN,
    },
  ],
};

export const ORDER_LOCAL_REQUEST_UPDATE_DOCS: THttpDocs = {
  summary: 'Editar solicitud',
  access: 'employee',
  params: OrderParamDto,
  body: UpdateRequestDto,
  success: API_ORDER_MESSAGE.SUCCESS.REQUEST_UPDATED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.REQUEST_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN,
    },
  ],
};

export const ORDER_LOCAL_REQUEST_REMOVE_DOCS: THttpDocs = {
  summary: 'Eliminar solicitud',
  access: 'employee',
  params: OrderParamDto,
  success: API_ORDER_MESSAGE.SUCCESS.REQUEST_DELETED,
  data: 'none',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.REQUEST_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN,
    },
  ],
};
