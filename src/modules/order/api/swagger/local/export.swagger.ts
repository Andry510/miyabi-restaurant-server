import { HttpStatus } from '@nestjs/common';

//Api
import { API_ORDER_MESSAGE } from '../../messages';

//Application
import { OrderParamDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const ORDER_LOCAL_EXPORT_EXPORT_DOCS: THttpDocs = {
  summary: 'Excel del pedido',
  access: 'manager',
  params: OrderParamDto,
  success: API_ORDER_MESSAGE.SUCCESS.ORDER_EXPORTED,
  data: 'file',
  errors: [
    {
      status: HttpStatus.NOT_FOUND,
      message: API_ORDER_MESSAGE.ERROR.ORDER_NOT_FOUND,
    },
  ],
};
