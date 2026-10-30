import type { Provider } from '@nestjs/common';

//Application
import { LocalSessionService } from './local';
import { RevocationService, SessionService } from './cloud';

//Infrastructure
import { SESSION_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SESSION_SERVICES_PROVIDERS: Provider[] = [
  RevocationService,
  {
    provide: SESSION_PROVIDER_TOKENS.SERVICES.SESSION,
    useClass: SessionService,
  },
  {
    provide: SESSION_PROVIDER_TOKENS.SERVICES.LOCAL,
    useClass: LocalSessionService,
  },
];
