import type { Provider } from '@nestjs/common';

//Infrastructure
import { SETTING_PROVIDER_TOKENS } from '../constants';
import { SettingRepository } from './local/setting.repository';

export const SETTING_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: SETTING_PROVIDER_TOKENS.REPOSITORIES.SETTING,
    useClass: SettingRepository,
  },
];
