import type { Provider } from '@nestjs/common';

//Infrastructure
import { CHECK_PROVIDER_TOKENS } from '../constants';
import { CheckRepository } from './local';

export const CHECK_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: CHECK_PROVIDER_TOKENS.REPOSITORIES.CHECK,
    useClass: CheckRepository,
  },
];
