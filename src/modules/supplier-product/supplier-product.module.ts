import { Module } from '@nestjs/common';

//Api
import * as SUPPLIER_PRODUCT_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { SUPPLIER_PRODUCT_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { SUPPLIER_PRODUCT_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(SUPPLIER_PRODUCT_CONTROLLERS_PROVIDERS),
  providers: [
    ...SUPPLIER_PRODUCT_SERVICES_PROVIDERS,
    ...SUPPLIER_PRODUCT_REPOSITORIES_PROVIDERS,
  ],
})
export class SupplierProductModule {}
