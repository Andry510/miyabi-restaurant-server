import { Module } from '@nestjs/common';

//Api
import * as ME_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { ME_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { ME_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(ME_CONTROLLERS_PROVIDERS),
  providers: [...ME_SERVICES_PROVIDERS, ...ME_REPOSITORIES_PROVIDERS],
})
export class MeModule {}
