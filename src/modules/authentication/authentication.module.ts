import { Module } from '@nestjs/common';

//Api
import * as AUTHENTICATION_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { AUTHENTICATION_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { AUTHENTICATION_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(AUTHENTICATION_CONTROLLERS_PROVIDERS),
  providers: [
    ...AUTHENTICATION_SERVICES_PROVIDERS,
    ...AUTHENTICATION_REPOSITORIES_PROVIDERS,
  ],
})
export class AuthenticationModule {}
