import type { Provider } from '@nestjs/common';

//Infrastructure
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../constants';
import { CloudSupplierProductRepository } from './cloud/supplier-product.repository';

export const SUPPLIER_PRODUCT_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide:
      SUPPLIER_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SUPPLIER_PRODUCT,
    useClass: CloudSupplierProductRepository,
  },
];
