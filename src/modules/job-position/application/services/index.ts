import type { Provider } from '@nestjs/common';

//Application
import { JobPositionService } from './local/job-position.service';

//Infrastructure
import { JOB_POSITION_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const JOB_POSITION_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: JOB_POSITION_PROVIDER_TOKENS.SERVICES.JOB_POSITION,
    useClass: JobPositionService,
  },
];
