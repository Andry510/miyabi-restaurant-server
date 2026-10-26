import { Module } from '@nestjs/common';

//Api
import * as PRODUCT_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { PRODUCT_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { PRODUCT_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(PRODUCT_CONTROLLERS_PROVIDERS),
  providers: [...PRODUCT_SERVICES_PROVIDERS, ...PRODUCT_REPOSITORIES_PROVIDERS],
})
export class ProductModule {}
