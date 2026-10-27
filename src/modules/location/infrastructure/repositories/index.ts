import type { Provider } from '@nestjs/common';

//Infrastructure
import { LOCATION_PROVIDER_TOKENS } from '../constants';
import { CloudLocationRepository } from './cloud';

export const LOCATION_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: LOCATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_LOCATION,
    useClass: CloudLocationRepository,
  },
];
