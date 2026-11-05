import type { Provider } from '@nestjs/common';

//Infrastructure
import { NOTIFICATION_PROVIDER_TOKENS } from '../constants';
import { NotificationRepository } from './local';

export const NOTIFICATION_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: NOTIFICATION_PROVIDER_TOKENS.REPOSITORIES.NOTIFICATION,
    useClass: NotificationRepository,
  },
];
