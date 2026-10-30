import type { Provider } from '@nestjs/common';

//Infrastructure
import { ME_PROVIDER_TOKENS } from '../constants';
import { CloudMeRepository } from './cloud';
import { LocalUserRepository } from './local';

export const ME_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: ME_PROVIDER_TOKENS.REPOSITORIES.CLOUD_ME,
    useClass: CloudMeRepository,
  },
  {
    provide: ME_PROVIDER_TOKENS.REPOSITORIES.LOCAL_USER,
    useClass: LocalUserRepository,
  },
];
