import type { Provider } from '@nestjs/common';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../constants';
import { CloudAuthenticationRepository } from './cloud/authentication.repository';
import { SessionRepository } from './local/session.repository';
import { UserAccountRepository } from './local/user-account.repository';

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
