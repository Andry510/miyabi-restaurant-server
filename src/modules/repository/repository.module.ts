import { Module } from '@nestjs/common';

//Application
import { REPOSITORY_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { REPOSITORY_PROVIDER_TOKENS } from './infrastructure/constants';
import { REPOSITORY_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  providers: [
    ...REPOSITORY_SERVICES_PROVIDERS,
    ...REPOSITORY_REPOSITORIES_PROVIDERS,
  ],
  exports: [
    REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY,
    REPOSITORY_PROVIDER_TOKENS.SERVICES.CATALOG,
  ],
})
export class RepositoryModule {}
