//Api
import { API_SUPPLIER_MESSAGE } from '../../messages';

//Application
import { SupplierParamDto, SuppliersQueryDto } from '../../../application/dto';

//Infrastructure
import type { THttpDocs } from '@infrastructure/http';

export const SUPPLIER_CLOUD_SUPPLIERS_DOCS: THttpDocs = {
  summary: 'Listar proveedores',
  access: 'manager',
  cloud: true,
  query: SuppliersQueryDto,
  success: API_SUPPLIER_MESSAGE.SUCCESS.SUPPLIERS_RETRIEVED,
  data: 'pagination',
};

export const SUPPLIER_CLOUD_SUPPLIER_DOCS: THttpDocs = {
  summary: 'Ver proveedor',
  access: 'manager',
  cloud: true,
  params: SupplierParamDto,
  success: API_SUPPLIER_MESSAGE.SUCCESS.SUPPLIER_RETRIEVED,
};
