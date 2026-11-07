import { Module } from '@nestjs/common';

//Api
import * as NOTIFICATION_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { NOTIFICATION_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { NOTIFICATION_PROVIDER_TOKENS } from './infrastructure/constants';
import { NOTIFICATION_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

//Modules
import { ChannelModule } from '../channel';
import { SettingModule } from '../setting';
import { SocketModule } from '../socket';

@Module({
  imports: [ChannelModule, SettingModule, SocketModule],
  controllers: Object.values(NOTIFICATION_CONTROLLERS_PROVIDERS),
  providers: [
    ...NOTIFICATION_SERVICES_PROVIDERS,
    ...NOTIFICATION_REPOSITORIES_PROVIDERS,
  ],
  exports: [NOTIFICATION_PROVIDER_TOKENS.SERVICES.NOTIFICATION],
})
export class NotificationModule {}
