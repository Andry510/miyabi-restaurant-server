import type { Provider } from '@nestjs/common';

//Application
import { ConnectionService, SocketService } from './local';

//Infrastructure
import { SOCKET_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SOCKET_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SOCKET_PROVIDER_TOKENS.SERVICES.CONNECTION,
    useClass: ConnectionService,
  },
  {
    provide: SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET,
    useClass: SocketService,
  },
];
