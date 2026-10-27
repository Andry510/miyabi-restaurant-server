import type { Provider } from '@nestjs/common';

//Application
import { WorkAreaService } from './local';

//Infrastructure
import { WORK_AREA_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const WORK_AREA_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: WORK_AREA_PROVIDER_TOKENS.SERVICES.WORK_AREA,
    useClass: WorkAreaService,
  },
];
