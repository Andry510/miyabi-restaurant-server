import { Module } from '@nestjs/common';

//Api
import * as TIP_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { TIP_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { TIP_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { RepositoryModule } from '../repository';
import { SettingModule } from '../setting';
import { WorkScheduleModule } from '../work-schedule';

@Module({
  imports: [RepositoryModule, SettingModule, WorkScheduleModule],
  controllers: Object.values(TIP_CONTROLLERS_PROVIDERS),
  providers: [...TIP_SERVICES_PROVIDERS, ...TIP_REPOSITORIES_PROVIDERS],
})
export class TipModule {}
