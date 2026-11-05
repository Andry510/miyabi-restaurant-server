import type { Provider } from '@nestjs/common';

//Application
import { NotificationService, ReaderService } from './local';

//Infrastructure
import { NOTIFICATION_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const NOTIFICATION_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: NOTIFICATION_PROVIDER_TOKENS.SERVICES.NOTIFICATION,
    useClass: NotificationService,
  },
  {
    provide: NOTIFICATION_PROVIDER_TOKENS.SERVICES.READER,
    useClass: ReaderService,
  },
];
