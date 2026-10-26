import type { Provider } from '@nestjs/common';

//Application
import { ProductService } from './cloud/product.service';
import { SupplierProductService } from './cloud/supplier-product.service';
import { SupplierService } from './cloud/supplier.service';

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
