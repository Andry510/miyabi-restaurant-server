import type { Provider } from '@nestjs/common';

//Application
import { JobPositionService } from './local/job-position.service';
import { WorkAreaService } from './local/work-area.service';

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
