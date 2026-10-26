import { Module } from '@nestjs/common';

//Api
import * as PAIRING_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { PAIRING_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { PAIRING_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { RepositoryModule } from '../repository';

@Module({
  imports: [RepositoryModule],
  controllers: Object.values(PAIRING_CONTROLLERS_PROVIDERS),
  providers: [...PAIRING_SERVICES_PROVIDERS, ...PAIRING_REPOSITORIES_PROVIDERS],
})
export class PairingModule {}
