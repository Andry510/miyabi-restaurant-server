import type { Provider } from '@nestjs/common';

//Application
import { SettingService } from './local/setting.service';

//Infrastructure
import { SETTING_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SETTING_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SETTING_PROVIDER_TOKENS.SERVICES.SETTING,
    useClass: SettingService,
  },
];
