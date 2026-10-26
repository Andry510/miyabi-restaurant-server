import { Module } from '@nestjs/common';

//Application
import { SOCKET_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { SOCKET_PROVIDER_TOKENS } from './infrastructure/constants';

//Modules
import { RepositoryModule } from '../repository';

@Module({
  imports: [RepositoryModule],
  providers: [...SOCKET_SERVICES_PROVIDERS],
  exports: [SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET],
})
export class SocketModule {}
