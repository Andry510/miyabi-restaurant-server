import type { Provider } from '@nestjs/common';

//Application
import {
  AttendanceService,
  ReportService,
  ShiftService,
  WeekService,
} from './local';

//Infrastructure
import { SHIFT_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SHIFT_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SHIFT_PROVIDER_TOKENS.SERVICES.SHIFT,
    useClass: ShiftService,
  },
  {
    provide: SHIFT_PROVIDER_TOKENS.SERVICES.ATTENDANCE,
    useClass: AttendanceService,
  },
  {
    provide: SHIFT_PROVIDER_TOKENS.SERVICES.WEEK,
    useClass: WeekService,
  },
  {
    provide: SHIFT_PROVIDER_TOKENS.SERVICES.REPORT,
    useClass: ReportService,
  },
];
