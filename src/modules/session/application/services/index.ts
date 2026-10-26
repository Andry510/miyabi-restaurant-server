import type { Provider } from '@nestjs/common';

//Application
import { LocalService } from './local/session.service';
import { SessionService } from './cloud/session.service';

//Infrastructure
import { SESSION_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SESSION_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SESSION_PROVIDER_TOKENS.SERVICES.SESSION,
    useClass: SessionService,
  },
  {
    provide: SESSION_PROVIDER_TOKENS.SERVICES.LOCAL,
    useClass: LocalService,
  },
];
