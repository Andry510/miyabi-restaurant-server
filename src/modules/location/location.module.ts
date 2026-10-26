import { Module } from '@nestjs/common';

//Api
import * as LOCATION_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { LOCATION_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { LOCATION_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(LOCATION_CONTROLLERS_PROVIDERS),
  providers: [
    ...LOCATION_SERVICES_PROVIDERS,
    ...LOCATION_REPOSITORIES_PROVIDERS,
  ],
})
export class LocationModule {}
