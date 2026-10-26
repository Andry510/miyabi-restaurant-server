import { Module } from '@nestjs/common';

//Api
import * as JOB_POSITION_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { JOB_POSITION_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { JOB_POSITION_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { RepositoryModule } from '../repository';

@Module({
  imports: [RepositoryModule],
  controllers: Object.values(JOB_POSITION_CONTROLLERS_PROVIDERS),
  providers: [
    ...JOB_POSITION_SERVICES_PROVIDERS,
    ...JOB_POSITION_REPOSITORIES_PROVIDERS,
  ],
})
export class JobPositionModule {}
