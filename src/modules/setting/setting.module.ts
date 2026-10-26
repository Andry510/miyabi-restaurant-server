import { Module } from '@nestjs/common';

//Api
import * as SETTING_CONTROLLERS_PROVIDERS from './api/controllers';

//Application
import { SETTING_SERVICES_PROVIDERS } from './application/services';

//Infrastructure
import { SETTING_PROVIDER_TOKENS } from './infrastructure/constants';
import { SETTING_REPOSITORIES_PROVIDERS } from './infrastructure/repositories';

@Module({
  controllers: Object.values(SETTING_CONTROLLERS_PROVIDERS),
  providers: [...SETTING_SERVICES_PROVIDERS, ...SETTING_REPOSITORIES_PROVIDERS],
  exports: [SETTING_PROVIDER_TOKENS.SERVICES.SETTING],
})
export class SettingModule {}
