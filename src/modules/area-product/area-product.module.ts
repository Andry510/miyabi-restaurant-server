import { Module } from '@nestjs/common';

//Api
import * as AREA_PRODUCT_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { AREA_PRODUCT_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { AREA_PRODUCT_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { RepositoryModule } from '../repository';

@Module({
  imports: [RepositoryModule],
  controllers: Object.values(AREA_PRODUCT_CONTROLLERS_PROVIDERS),
  providers: [
    ...AREA_PRODUCT_SERVICES_PROVIDERS,
    ...AREA_PRODUCT_REPOSITORIES_PROVIDERS,
  ],
})
export class AreaProductModule {}
