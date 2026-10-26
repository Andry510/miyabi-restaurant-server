import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';
import { io, type Socket } from 'socket.io-client';

//Common
import { SYSTEM_MESSAGE } from '@common/messages';

//Domain
import type { ISocketService } from '../../../domain/interfaces/services';
import type {
  TSocketConnectError,
  TSocketHandler,
} from '../../../domain/types/services';
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Env } from '@infrastructure/config';
import { GrpcState } from '@infrastructure/constants';
import {
  SOCKET_EVENT,
  SOCKET_HANDSHAKE_KEY,
  SOCKET_LIMITS,
  SOCKET_LOGGER_NAME,
} from '../../../infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';

const REJECTED_CODES: number[] = [
  GrpcState.UNAUTHENTICATED,
  GrpcState.PERMISSION_DENIED,
];

@Injectable()
export class SocketService
  implements ISocketService, OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(SOCKET_LOGGER_NAME.SERVICE.SOCKET);

  private socket: Socket | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private readonly handlers = new Map<string, TSocketHandler[]>();

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository_service: IRepositoryService,
  ) {}

  onApplicationBootstrap(): void {
    this.connect();
  }

  onModuleDestroy(): void {
    this.close();
  }

  on(event: string, handler: TSocketHandler): void {
    const handlers = this.handlers.get(event) ?? [];
    handlers.push(handler);
    this.handlers.set(event, handlers);
  }

  connect(): void {
    const tokenResult = this.repository_service.serverToken();

    if (tokenResult.IsFailure) {
      this.logger.info(SYSTEM_MESSAGE.ERROR.SOCKET_NOT_PAIRED);
      return;
    }

    const serverToken = tokenResult.Value;

    this.close();

    const socket = io(Env.CLOUD_SOCKET_URL, {
      auth: { [SOCKET_HANDSHAKE_KEY.SERVER_TOKEN]: serverToken },
      transports: ['websocket'],
    });

    socket.on('connect', () =>
      this.logger.info(SYSTEM_MESSAGE.SUCCESS.SOCKET_CONNECTED),
    );
    socket.on('disconnect', (reason) =>
      this.logger.warn(SYSTEM_MESSAGE.ERROR.SOCKET_DISCONNECTED(reason)),
    );
    socket.on('connect_error', (error: TSocketConnectError) =>
      this.handleConnectError(socket, error),
    );
    socket.on(SOCKET_EVENT.SESSION_EXPIRED, (payload: { reason?: string }) => {
      this.logger.warn(
        SYSTEM_MESSAGE.ERROR.SOCKET_SESSION_EXPIRED(String(payload?.reason)),
      );
      this.close();
    });
    socket.onAny((event: string, payload: unknown) => {
      void this.dispatch(event, payload);
    });

    this.socket = socket;
  }

  //Functions
  private handleConnectError(socket: Socket, error: TSocketConnectError): void {
    if (socket.active) {
      this.logger.warn(SYSTEM_MESSAGE.ERROR.SOCKET_UNREACHABLE(error.message));
      return;
    }

    if (REJECTED_CODES.includes(error.data?.code ?? -1)) {
      this.logger.error(SYSTEM_MESSAGE.ERROR.SOCKET_REJECTED(error.message));
      this.close();
      return;
    }

    this.logger.warn(SYSTEM_MESSAGE.ERROR.SOCKET_RETRY(error.message));
    this.retryTimer = setTimeout(
      () => socket.connect(),
      SOCKET_LIMITS.RETRY_MS,
    );
    this.retryTimer.unref();
  }

  private async dispatch(event: string, payload: unknown): Promise<void> {
    for (const handler of this.handlers.get(event) ?? []) {
      try {
        await handler(payload);
      } catch (error) {
        this.logger.error(SYSTEM_MESSAGE.ERROR.SOCKET_HANDLER_FAILED(event));
        this.logger.error(error);
      }
    }
  }

  private close(): void {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }
}
