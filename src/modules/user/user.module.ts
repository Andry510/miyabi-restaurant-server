import { Module } from '@nestjs/common';

//Api
import * as USER_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { USER_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { USER_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(USER_CONTROLLERS_PROVIDERS),
  providers: [...USER_SERVICES_PROVIDERS, ...USER_REPOSITORIES_PROVIDERS],
})
export class UserModule {}
