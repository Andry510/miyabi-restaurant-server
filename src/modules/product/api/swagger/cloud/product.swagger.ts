//Api
import { API_PRODUCT_MESSAGE } from '../../messages';

//Application
import { ProductParamDto, ProductsQueryDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const PRODUCT_CLOUD_PRODUCTS_DOCS: THttpDocs = {
  summary: 'Listar productos',
  access: 'manager_cloud',
  cloud: true,
  query: ProductsQueryDto,
  success: API_PRODUCT_MESSAGE.SUCCESS.PRODUCTS_RETRIEVED,
  data: 'pagination',
};

export const PRODUCT_CLOUD_PRODUCT_DOCS: THttpDocs = {
  summary: 'Ver producto',
  access: 'manager_cloud',
  cloud: true,
  params: ProductParamDto,
  success: API_PRODUCT_MESSAGE.SUCCESS.PRODUCT_RETRIEVED,
};
