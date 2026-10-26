import type { Provider } from '@nestjs/common';

//Application
import { SocketService } from './cloud/socket.service';

//Infrastructure
import { SOCKET_PROVIDER_TOKENS } from '../../infrastructure/constants';

export const SOCKET_SERVICES_PROVIDERS: Provider[] = [
  {
    provide: SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET,
    useClass: SocketService,
  },
];
