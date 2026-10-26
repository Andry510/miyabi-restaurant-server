import type { Provider } from '@nestjs/common';

//Infrastructure
import { AREA_JOB_POSITION_PROVIDER_TOKENS } from '../constants';
import { AreaJobPositionRepository } from './area-job-position.repository';

export const AREA_JOB_POSITION_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: AREA_JOB_POSITION_PROVIDER_TOKENS.REPOSITORIES.AREA_JOB_POSITION,
    useClass: AreaJobPositionRepository,
  },
];
