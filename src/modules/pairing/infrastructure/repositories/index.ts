import type { Provider } from '@nestjs/common';

//Infrastructure
import { PAIRING_PROVIDER_TOKENS } from '../constants';
import { CloudServerRepository } from './cloud/server.repository';

export const PAIRING_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: PAIRING_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SERVER,
    useClass: CloudServerRepository,
  },
];
