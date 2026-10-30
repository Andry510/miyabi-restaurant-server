import type { Provider } from '@nestjs/common';

//Application
import { ChannelService } from './cloud';

//Infrastructure
import { CHANNEL_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const CHANNEL_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: CHANNEL_PROVIDER_TOKENS.SERVICES.CHANNEL,
    useClass: ChannelService,
  },
];
