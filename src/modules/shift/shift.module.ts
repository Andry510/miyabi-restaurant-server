import { Module } from '@nestjs/common';

//Api
import * as SHIFT_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { SHIFT_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { SHIFT_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { SettingModule } from '../setting';
import { WorkScheduleModule } from '../work-schedule';

@Module({
  imports: [SettingModule, WorkScheduleModule],
  controllers: Object.values(SHIFT_CONTROLLERS_PROVIDERS),
  providers: [...SHIFT_SERVICES_PROVIDERS, ...SHIFT_REPOSITORIES_PROVIDERS],
})
export class ShiftModule {}
