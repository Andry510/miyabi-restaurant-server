import { Module } from '@nestjs/common';

//Api
import * as SUPPLIER_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { SUPPLIER_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { SUPPLIER_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(SUPPLIER_CONTROLLERS_PROVIDERS),
  providers: [
    ...SUPPLIER_SERVICES_PROVIDERS,
    ...SUPPLIER_REPOSITORIES_PROVIDERS,
  ],
})
export class SupplierModule {}
