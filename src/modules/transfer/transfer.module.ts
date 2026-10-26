import { Module } from '@nestjs/common';

//Api
import * as TRANSFER_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { TRANSFER_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { TRANSFER_PROVIDER_TOKENS } from './infrastructure/constants';
import { TRANSFER_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(TRANSFER_CONTROLLERS_PROVIDERS),
  providers: [
    ...TRANSFER_SERVICES_PROVIDERS,
    ...TRANSFER_REPOSITORIES_PROVIDERS,
  ],
  exports: [TRANSFER_PROVIDER_TOKENS.SERVICES.TRANSFER],
})
export class TransferModule {}
