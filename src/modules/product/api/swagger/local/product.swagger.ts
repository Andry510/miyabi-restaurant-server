import { HttpStatus } from '@nestjs/common';

//Api
import { API_PRODUCT_MESSAGE } from '../../messages';

//Application
import { LocalProductsQueryDto } from '../../../application/dto';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const PRODUCT_LOCAL_PRODUCTS_DOCS: THttpDocs = {
  summary: 'Listar productos',
  access: 'employee',
  query: LocalProductsQueryDto,
  success: API_PRODUCT_MESSAGE.SUCCESS.PRODUCTS_RETRIEVED,
  data: 'pagination',
  errors: [
    {
      status: HttpStatus.FORBIDDEN,
      message: API_MESSAGE_GLOBAL.ERROR.USER_WITHOUT_ASSIGNMENT,
    },
  ],
};
