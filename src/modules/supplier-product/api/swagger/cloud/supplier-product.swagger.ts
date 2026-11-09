//Api
import { API_SUPPLIER_PRODUCT_MESSAGE } from '../../messages';

//Application
import { SupplierProductParamDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SUPPLIER_PRODUCT_CLOUD_DETAIL_DOCS: THttpDocs = {
  summary: 'Detalle de proveedor y producto',
  access: 'manager',
  cloud: true,
  params: SupplierProductParamDto,
  success: API_SUPPLIER_PRODUCT_MESSAGE.SUCCESS.SUPPLIER_PRODUCT_RETRIEVED,
};
