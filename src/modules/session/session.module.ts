import { Module } from '@nestjs/common';

//Api
import * as SESSION_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { SESSION_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { SESSION_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(SESSION_CONTROLLERS_PROVIDERS),
  providers: [...SESSION_SERVICES_PROVIDERS, ...SESSION_REPOSITORIES_PROVIDERS],
})
export class SessionModule {}
