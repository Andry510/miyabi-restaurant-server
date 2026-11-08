import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Domain
import type { IManagerSessionService } from '../../../domain/interfaces/services';
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';
import type { IChannelService } from '../../../../channel/domain/interfaces/services';

//Infrastructure
import { SESSION_PROVIDER_TOKENS } from '../../../infrastructure/constants';
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
    @Inject(SESSION_PROVIDER_TOKENS.SERVICES.MANAGER)
    private readonly manager_session_service: IManagerSessionService,
  ) {}

  onModuleInit(): void {
    this.channel_service.on(CHANNEL_EVENT.SESSION_REVOKED, (payload) => {
      const sessionKey = (payload as { session_key?: unknown } | null)
        ?.session_key;

      return typeof sessionKey === 'string'
        ? this.revoke(sessionKey)
        : undefined;
    });
  }

  //Functions
  private async revoke(sessionKey: string): Promise<void> {
    await this.manager_session_service.revoke(sessionKey);
    await this.repository_service.forgetManagerSession(sessionKey);
  }
}
