import type { Provider } from '@nestjs/common';

//Application
import { CatalogService } from './catalog.service';
import { RepositoryService } from './repository.service';

//Infrastructure
import { REPOSITORY_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const REPOSITORY_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY,
    useClass: RepositoryService,
  },
  {
    provide: REPOSITORY_PROVIDER_TOKENS.SERVICES.CATALOG,
    useClass: CatalogService,
  },
];
