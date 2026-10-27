import type { Provider } from '@nestjs/common';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../constants';
import { CloudAuthenticationRepository } from './cloud';
import { SessionRepository, UserAccountRepository } from './local';

export const AUTHENTICATION_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_AUTHENTICATION,
    useClass: CloudAuthenticationRepository,
  },
  {
    provide: AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.USER_ACCOUNT,
    useClass: UserAccountRepository,
  },
  {
    provide: AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.SESSION,
    useClass: SessionRepository,
  },
];
