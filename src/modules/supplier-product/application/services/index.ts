import type { Provider } from '@nestjs/common';

//Application
import {
  ProductService,
  SupplierProductService,
  SupplierService,
} from './cloud';

//Infrastructure
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SUPPLIER_PRODUCT_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SUPPLIER_PRODUCT_PROVIDER_TOKENS.SERVICES.SUPPLIER_PRODUCT,
    useClass: SupplierProductService,
  },
  {
    provide: SUPPLIER_PRODUCT_PROVIDER_TOKENS.SERVICES.SUPPLIER,
    useClass: SupplierService,
  },
  {
    provide: SUPPLIER_PRODUCT_PROVIDER_TOKENS.SERVICES.PRODUCT,
    useClass: ProductService,
  },
];
