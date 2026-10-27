import type { Provider } from '@nestjs/common';

//Infrastructure
import { WORK_SCHEDULE_PROVIDER_TOKENS } from '../constants';
import { WorkScheduleRepository } from './local';

export const WORK_SCHEDULE_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: WORK_SCHEDULE_PROVIDER_TOKENS.REPOSITORIES.WORK_SCHEDULE,
    useClass: WorkScheduleRepository,
  },
];
