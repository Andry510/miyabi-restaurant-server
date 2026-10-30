import { Module } from '@nestjs/common';

//Application
import { CHANNEL_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { CHANNEL_PROVIDER_TOKENS } from './infrastructure/constants';
import { CHANNEL_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { RepositoryModule } from '../repository';

@Module({
  imports: [RepositoryModule],
  providers: [...CHANNEL_SERVICES_PROVIDERS, ...CHANNEL_REPOSITORIES_PROVIDERS],
  exports: [CHANNEL_PROVIDER_TOKENS.SERVICES.CHANNEL],
})
export class ChannelModule {}
