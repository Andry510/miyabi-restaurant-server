import { Module } from '@nestjs/common';

//Api
import * as CHECK_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { CHECK_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { CHECK_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { SettingModule } from '../setting';

@Module({
  imports: [SettingModule],
  controllers: Object.values(CHECK_CONTROLLERS_PROVIDERS),
  providers: [...CHECK_SERVICES_PROVIDERS, ...CHECK_REPOSITORIES_PROVIDERS],
})
export class CheckModule {}
