import { HttpStatus } from '@nestjs/common';

//Api
import { API_ORDER_MESSAGE } from '../../messages';

//Application
import {
  ItemBodyDto,
  ItemParamDto,
  OrderParamDto,
  OrdersQueryDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const ORDER_LOCAL_CURRENT_DOCS: THttpDocs = {
  summary: 'Pedido abierto del día',
  access: 'manager',
  success: API_ORDER_MESSAGE.SUCCESS.CURRENT_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
    },
  ],
};

export const ORDER_LOCAL_SAVE_ITEM_DOCS: THttpDocs = {
  summary: 'Guardar un producto del pedido',
  access: 'manager',
  params: ItemParamDto,
  body: ItemBodyDto,
  success: API_ORDER_MESSAGE.SUCCESS.ITEM_SAVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.PRODUCT_NOT_FOUND,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN,
    },
  ],
};

export const ORDER_LOCAL_RESET_ITEM_DOCS: THttpDocs = {
  summary: 'Restablecer un producto del pedido',
  access: 'manager',
  params: ItemParamDto,
  success: API_ORDER_MESSAGE.SUCCESS.ITEM_RESET,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.NO_OPEN_ORDER,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
    },
  ],
};

export const ORDER_LOCAL_SEND_DOCS: THttpDocs = {
  summary: 'Enviar el pedido a la nube',
  description:
    'Arma un envío por almacén (y uno sin destino) con su idempotency_key. Responde ORDER_SENT si todo llegó, ORDER_PENDING si la nube no respondió (se reintenta después) u ORDER_FAILED si la nube rechazó algún envío.',
  access: 'manager',
  success: [
    API_ORDER_MESSAGE.SUCCESS.ORDER_SENT,
    API_ORDER_MESSAGE.SUCCESS.ORDER_PENDING,
    API_ORDER_MESSAGE.SUCCESS.ORDER_FAILED,
  ],
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.NO_OPEN_ORDER,
    },
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.EMPTY_ORDER,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.ORDER_SENDING,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_OPEN,
    },
  ],
};

export const ORDER_LOCAL_ORDERS_DOCS: THttpDocs = {
  summary: 'Listar pedidos',
  access: 'manager',
  query: OrdersQueryDto,
  success: API_ORDER_MESSAGE.SUCCESS.ORDERS_RETRIEVED,
  data: 'pagination',
};

export const ORDER_LOCAL_ORDER_DOCS: THttpDocs = {
  summary: 'Ver pedido',
  access: 'manager',
  params: OrderParamDto,
  success: API_ORDER_MESSAGE.SUCCESS.ORDER_RETRIEVED,
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
    },
  ],
};

export const ORDER_LOCAL_RETRY_DOCS: THttpDocs = {
  summary: 'Reintentar envíos del pedido',
  description:
    'Reenvía los envíos pending y failed con la misma idempotency_key, así la nube no duplica el pedido.',
  access: 'manager',
  params: OrderParamDto,
  success: [
    API_ORDER_MESSAGE.SUCCESS.ORDER_SENT,
    API_ORDER_MESSAGE.SUCCESS.ORDER_PENDING,
    API_ORDER_MESSAGE.SUCCESS.ORDER_FAILED,
  ],
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.ORDER_SENDING,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.NOTHING_TO_RETRY,
    },
  ],
};

export const ORDER_LOCAL_RETRY_ALL_DOCS: THttpDocs = {
  summary: 'Reintentar todos los pedidos con envíos pendientes',
  access: 'manager',
  success: [
    API_ORDER_MESSAGE.SUCCESS.ORDERS_RETRIED,
    API_ORDER_MESSAGE.SUCCESS.ORDER_FAILED,
    API_ORDER_MESSAGE.SUCCESS.ORDER_PENDING,
    API_ORDER_MESSAGE.SUCCESS.ORDER_SENT,
  ],
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
    },
    {
      status: HttpStatus.CONFLICT,
      message: API_ORDER_MESSAGE.ERROR.NO_PENDING_ORDERS,
    },
  ],
};
