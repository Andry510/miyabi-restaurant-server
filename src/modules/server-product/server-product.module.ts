import { Module } from '@nestjs/common';

//Application
import { SERVER_PRODUCT_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { SERVER_PRODUCT_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

import { ChannelModule } from '../channel';

@Module({
  imports: [ChannelModule],
  providers: [
    ...SERVER_PRODUCT_SERVICES_PROVIDERS,
    ...SERVER_PRODUCT_REPOSITORIES_PROVIDERS,
  ],
})
export class ServerProductModule {}
