import type { Provider } from '@nestjs/common';

//Infrastructure
import { USER_PROVIDER_TOKENS } from '../constants';
import { AttendanceRepository } from './attendance.repository';
import { SessionRepository } from './session.repository';
import { UserRepository } from './user.repository';

export const USER_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: USER_PROVIDER_TOKENS.REPOSITORIES.USER,
    useClass: UserRepository,
  },
  {
    provide: USER_PROVIDER_TOKENS.REPOSITORIES.SESSION,
    useClass: SessionRepository,
  },
  {
    provide: USER_PROVIDER_TOKENS.REPOSITORIES.ATTENDANCE,
    useClass: AttendanceRepository,
  },
];
