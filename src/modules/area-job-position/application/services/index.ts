import type { Provider } from '@nestjs/common';

//Application
import { JobPositionService, WorkAreaService } from './local';

//Infrastructure
import { AREA_JOB_POSITION_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const AREA_JOB_POSITION_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: AREA_JOB_POSITION_PROVIDER_TOKENS.SERVICES.WORK_AREA,
    useClass: WorkAreaService,
  },
  {
    provide: AREA_JOB_POSITION_PROVIDER_TOKENS.SERVICES.JOB_POSITION,
    useClass: JobPositionService,
  },
];
