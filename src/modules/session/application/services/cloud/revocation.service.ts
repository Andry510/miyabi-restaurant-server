import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Domain
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';
import type { IChannelService } from '../../../../channel/domain/interfaces/services';

//Infrastructure
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';
import {
  CHANNEL_EVENT,
  CHANNEL_PROVIDER_TOKENS,
} from '../../../../channel/infrastructure/constants';

@Injectable()
export class RevocationService implements OnModuleInit {
  constructor(
    @Inject(CHANNEL_PROVIDER_TOKENS.SERVICES.CHANNEL)
    private readonly channel_service: IChannelService,
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository_service: IRepositoryService,
  ) {}

  onModuleInit(): void {
    this.channel_service.on(CHANNEL_EVENT.SESSION_REVOKED, (payload) => {
      const sessionKey = (payload as { session_key?: unknown } | null)
        ?.session_key;

      return typeof sessionKey === 'string'
        ? this.repository_service.forgetManagerSession(sessionKey)
        : undefined;
    });
  }
}
