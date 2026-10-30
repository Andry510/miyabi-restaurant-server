import type { Provider } from '@nestjs/common';

//Infrastructure
import { SHIFT_PROVIDER_TOKENS } from '../constants';
import { AttendanceRepository, ShiftRepository, WeekRepository } from './local';

export const SHIFT_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: SHIFT_PROVIDER_TOKENS.REPOSITORIES.SHIFT,
    useClass: ShiftRepository,
  },
  {
    provide: SHIFT_PROVIDER_TOKENS.REPOSITORIES.ATTENDANCE,
    useClass: AttendanceRepository,
  },
  {
    provide: SHIFT_PROVIDER_TOKENS.REPOSITORIES.WEEK,
    useClass: WeekRepository,
  },
];
