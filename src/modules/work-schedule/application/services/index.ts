import type { Provider } from '@nestjs/common';

//Application
import { WorkScheduleService } from './local';

//Infrastructure
import { WORK_SCHEDULE_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const WORK_SCHEDULE_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: WORK_SCHEDULE_PROVIDER_TOKENS.SERVICES.WORK_SCHEDULE,
    useClass: WorkScheduleService,
  },
];
