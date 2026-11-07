import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';

//Domain
import type { IChannelService } from '../../../../channel/domain/interfaces/services';
import type { ISocketService } from '../../../../socket/domain/interfaces/services';

//Infrastructure
import {
  CHANNEL_EVENT,
  CHANNEL_PROVIDER_TOKENS,
} from '../../../../channel/infrastructure/constants';
import {
  CloudNotificationMapper,
  type TGrpcNotification,
} from '../../../../me/infrastructure/mappers';
import {
  SOCKET_EVENT,
  SOCKET_PROVIDER_TOKENS,
} from '../../../../socket/infrastructure/constants';

type TNotificationEvent = {
  user_id?: string;
  notification?: TGrpcNotification;
};

@Injectable()
export class RelayService implements OnModuleInit {
  constructor(
    @Inject(CHANNEL_PROVIDER_TOKENS.SERVICES.CHANNEL)
    private readonly channel_service: IChannelService,
    @Inject(SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET)
    private readonly socket_service: ISocketService,
  ) {}

  onModuleInit(): void {
    this.channel_service.on(CHANNEL_EVENT.NOTIFICATION, (payload) =>
      this.relay(payload as TNotificationEvent),
    );
  }

  //Functions
  private relay(event: TNotificationEvent): void {
    if (!event.user_id || !event.notification) {
      return;
    }

    const [notification] = CloudNotificationMapper.toOutput({
      notifications: [event.notification],
    }).notifications;

    this.socket_service.emitToManager(
      event.user_id,
      SOCKET_EVENT.CLOUD_NOTIFICATION,
      notification,
    );
  }
}
