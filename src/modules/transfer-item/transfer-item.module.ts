import { Module } from '@nestjs/common';

//Api
import * as TRANSFER_ITEM_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { TRANSFER_ITEM_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { TRANSFER_ITEM_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(TRANSFER_ITEM_CONTROLLERS_PROVIDERS),
  providers: [
    ...TRANSFER_ITEM_SERVICES_PROVIDERS,
    ...TRANSFER_ITEM_REPOSITORIES_PROVIDERS,
  ],
})
export class TransferItemModule {}
