import type { Provider } from '@nestjs/common';

//Application
import { SupplierService } from './cloud/supplier.service';

//Infrastructure
import { SUPPLIER_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SUPPLIER_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SUPPLIER_PROVIDER_TOKENS.SERVICES.SUPPLIER,
    useClass: SupplierService,
  },
];
