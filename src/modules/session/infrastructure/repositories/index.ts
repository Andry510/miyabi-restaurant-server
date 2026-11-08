import type { Provider } from '@nestjs/common';

//Infrastructure
import { SESSION_PROVIDER_TOKENS } from '../constants';
import { CloudSessionRepository } from './cloud';
import { ManagerSessionRepository, SessionRepository } from './local';

export const SESSION_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: SESSION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SESSION,
    useClass: CloudSessionRepository,
  },
  {
    provide: SESSION_PROVIDER_TOKENS.REPOSITORIES.SESSION,
    useClass: SessionRepository,
  },
  {
    provide: SESSION_PROVIDER_TOKENS.REPOSITORIES.MANAGER_SESSION,
    useClass: ManagerSessionRepository,
  },
];
