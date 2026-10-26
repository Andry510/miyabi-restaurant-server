import { Module } from '@nestjs/common';

//Api
import * as WORK_AREA_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { WORK_AREA_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { WORK_AREA_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { RepositoryModule } from '../repository';

@Module({
  imports: [RepositoryModule],
  controllers: Object.values(WORK_AREA_CONTROLLERS_PROVIDERS),
  providers: [
    ...WORK_AREA_SERVICES_PROVIDERS,
    ...WORK_AREA_REPOSITORIES_PROVIDERS,
  ],
})
export class WorkAreaModule {}
