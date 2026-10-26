import type { Provider } from '@nestjs/common';

//Infrastructure
import { SUPPLIER_PROVIDER_TOKENS } from '../constants';
import { CloudSupplierRepository } from './cloud/supplier.repository';

export const SUPPLIER_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: SUPPLIER_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SUPPLIER,
    useClass: CloudSupplierRepository,
  },
];
