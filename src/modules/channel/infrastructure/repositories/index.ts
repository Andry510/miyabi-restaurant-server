import type { Provider } from '@nestjs/common';

//Infrastructure
import { CHANNEL_PROVIDER_TOKENS } from '../constants';
import { CloudChannelRepository } from './cloud';
import { StatusRepository } from './local';

export const CHANNEL_REPOSITORIES_PROVIDERS: Provider[] = [
  {
    provide: CHANNEL_PROVIDER_TOKENS.REPOSITORIES.CLOUD_CHANNEL,
    useClass: CloudChannelRepository,
  },
  {
    provide: CHANNEL_PROVIDER_TOKENS.REPOSITORIES.STATUS,
    useClass: StatusRepository,
  },
];
