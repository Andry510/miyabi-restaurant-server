import type { Provider } from '@nestjs/common';

//Application
import { CheckService } from './local';

//Infrastructure
import { CHECK_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const CHECK_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: CHECK_PROVIDER_TOKENS.SERVICES.CHECK,
    useClass: CheckService,
  },
];
