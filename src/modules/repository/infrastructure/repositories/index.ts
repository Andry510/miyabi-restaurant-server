import type { Provider } from '@nestjs/common';

//Infrastructure
import { REPOSITORY_PROVIDER_TOKENS } from '../constants';
import { CatalogRepository } from './local/catalog.repository';
import { CloudSessionRepository } from './cloud/session.repository';
import { UserSessionRepository } from './local/user-session.repository';

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
