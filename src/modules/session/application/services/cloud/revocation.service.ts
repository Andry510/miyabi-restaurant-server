import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Domain
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';
import type { ISocketService } from '../../../../socket/domain/interfaces/services';

//Infrastructure
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';
import {
  SOCKET_EVENT,
  SOCKET_PROVIDER_TOKENS,
} from '../../../../socket/infrastructure/constants';

@Injectable()
export class RevocationService implements OnModuleInit {
  constructor(
    @Inject(SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET)
    private readonly socket_service: ISocketService,
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository_service: IRepositoryService,
  ) {}

  onModuleInit(): void {
    this.socket_service.on(SOCKET_EVENT.SESSION_REVOKED, (payload) => {
      const sessionKey = (payload as { session_key?: unknown } | null)
        ?.session_key;

      return typeof sessionKey === 'string'
        ? this.repository_service.forgetManagerSession(sessionKey)
        : undefined;
    });
  }
}
