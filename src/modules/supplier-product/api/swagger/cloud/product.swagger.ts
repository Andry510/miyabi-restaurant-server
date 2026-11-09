//Api
import { API_SUPPLIER_PRODUCT_MESSAGE } from '../../messages';

//Application
import {
  ProductSuppliersQueryDto,
  SupplierProductIdParamDto,
} from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SUPPLIER_PRODUCT_CLOUD_PRODUCT_SUPPLIERS_DOCS: THttpDocs = {
  summary: 'Proveedores de un producto',
  access: 'manager_cloud',
  cloud: true,
  params: SupplierProductIdParamDto,
  query: ProductSuppliersQueryDto,
  success: API_SUPPLIER_PRODUCT_MESSAGE.SUCCESS.SUPPLIERS_RETRIEVED,
  data: 'pagination',
};
