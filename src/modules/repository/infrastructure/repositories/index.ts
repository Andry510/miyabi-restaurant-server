import type { Provider } from '@nestjs/common';

//Infrastructure
import { REPOSITORY_PROVIDER_TOKENS } from '../constants';
import { CatalogRepository, UserSessionRepository } from './local';
import { CloudSessionRepository } from './cloud';

export const REPOSITORY_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: REPOSITORY_PROVIDER_TOKENS.REPOSITORIES.USER_SESSION,
    useClass: UserSessionRepository,
  },
  {
    provide: REPOSITORY_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SESSION,
    useClass: CloudSessionRepository,
  },
  {
    provide: REPOSITORY_PROVIDER_TOKENS.REPOSITORIES.CATALOG,
    useClass: CatalogRepository,
  },
];
