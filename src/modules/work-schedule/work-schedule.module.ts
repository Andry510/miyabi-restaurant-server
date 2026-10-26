import { Module } from '@nestjs/common';

//Api
import * as WORK_SCHEDULE_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { WORK_SCHEDULE_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { WORK_SCHEDULE_PROVIDER_TOKENS } from './infrastructure/constants';
import { WORK_SCHEDULE_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(WORK_SCHEDULE_CONTROLLERS_PROVIDERS),
  providers: [
    ...WORK_SCHEDULE_SERVICES_PROVIDERS,
    ...WORK_SCHEDULE_REPOSITORIES_PROVIDERS,
  ],
  exports: [WORK_SCHEDULE_PROVIDER_TOKENS.SERVICES.WORK_SCHEDULE],
})
export class WorkScheduleModule {}
