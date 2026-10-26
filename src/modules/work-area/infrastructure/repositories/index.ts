import type { Provider } from '@nestjs/common';

//Infrastructure
import { WORK_AREA_PROVIDER_TOKENS } from '../constants';
import { WorkAreaRepository } from './local/work-area.repository';

export const WORK_AREA_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: WORK_AREA_PROVIDER_TOKENS.REPOSITORIES.WORK_AREA,
    useClass: WorkAreaRepository,
  },
];
