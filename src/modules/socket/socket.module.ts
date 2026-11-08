import { Module } from '@nestjs/common';

//Api
import { SocketGateway } from './api/gateways';

//Application
import { SOCKET_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { SOCKET_PROVIDER_TOKENS } from './infrastructure/constants';

//Modules
import { MeModule } from '../me';
import { RepositoryModule } from '../repository';
import { SessionModule } from '../session';

@Module({
  imports: [MeModule, RepositoryModule, SessionModule],
  providers: [SocketGateway, ...SOCKET_SERVICES_PROVIDERS],
  exports: [SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET],
})
export class SocketModule {}
