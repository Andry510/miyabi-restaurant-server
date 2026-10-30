import { Module } from '@nestjs/common';

//Api
import * as ORDER_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { ORDER_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { ORDER_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { ChannelModule } from '../channel';
import { RepositoryModule } from '../repository';
import { SettingModule } from '../setting';
import { TransferModule } from '../transfer';

@Module({
  imports: [ChannelModule, RepositoryModule, SettingModule, TransferModule],
  controllers: Object.values(ORDER_CONTROLLERS_PROVIDERS),
  providers: [...ORDER_SERVICES_PROVIDERS, ...ORDER_REPOSITORIES_PROVIDERS],
})
export class OrderModule {}
