import { Module } from '@nestjs/common';

//Api
import * as AREA_JOB_POSITION_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { AREA_JOB_POSITION_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { AREA_JOB_POSITION_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { RepositoryModule } from '../repository';

@Module({
  imports: [RepositoryModule],
  controllers: Object.values(AREA_JOB_POSITION_CONTROLLERS_PROVIDERS),
  providers: [
    ...AREA_JOB_POSITION_SERVICES_PROVIDERS,
    ...AREA_JOB_POSITION_REPOSITORIES_PROVIDERS,
  ],
})
export class AreaJobPositionModule {}
