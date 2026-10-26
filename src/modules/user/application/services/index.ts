import type { Provider } from '@nestjs/common';

//Application
import { AttendanceService } from './local/attendance.service';
import { SessionService } from './local/session.service';
import { UserService } from './local/user.service';

//Infrastructure
import { USER_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const USER_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: USER_PROVIDER_TOKENS.SERVICES.USER,
    useClass: UserService,
  },
  {
    provide: USER_PROVIDER_TOKENS.SERVICES.SESSION,
    useClass: SessionService,
  },
  {
    provide: USER_PROVIDER_TOKENS.SERVICES.ATTENDANCE,
    useClass: AttendanceService,
  },
];
