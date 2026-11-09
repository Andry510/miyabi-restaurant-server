//Api
import { API_SUPPLIER_PRODUCT_MESSAGE } from '../../messages';

//Application
import {
  SupplierProductIdParamDto,
  SupplierProductsQueryDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SUPPLIER_PRODUCT_CLOUD_SUPPLIER_PRODUCTS_DOCS: THttpDocs = {
  summary: 'Productos de un proveedor',
  access: 'manager_cloud',
  cloud: true,
  params: SupplierProductIdParamDto,
  query: SupplierProductsQueryDto,
  success: API_SUPPLIER_PRODUCT_MESSAGE.SUCCESS.PRODUCTS_RETRIEVED,
  data: 'pagination',
};
