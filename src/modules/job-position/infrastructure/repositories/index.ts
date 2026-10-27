import type { Provider } from '@nestjs/common';

//Infrastructure
import { JOB_POSITION_PROVIDER_TOKENS } from '../constants';
import { JobPositionRepository } from './local';

export const JOB_POSITION_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: JOB_POSITION_PROVIDER_TOKENS.REPOSITORIES.JOB_POSITION,
    useClass: JobPositionRepository,
  },
];
