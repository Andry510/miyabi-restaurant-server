import { Inject } from '@nestjs/common';
import {
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';

//Domain
import type {
  IConnectionService,
  ISocketService,
} from '../../../domain/interfaces/services';
import type {
  TConnection,
  TConnectionTokens,
} from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Env } from '@infrastructure/config';
import { HttpErrorMapper } from '@infrastructure/mappers/shared';
import {
  SOCKET_HANDSHAKE_KEY,
  SOCKET_LIMITS,
  SOCKET_LOGGER_NAME,
  SOCKET_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

type THandshakeKey =
  (typeof SOCKET_HANDSHAKE_KEY)[keyof typeof SOCKET_HANDSHAKE_KEY];

type TSocketError = Error & { data?: { status: number; code: string } };

@WebSocketGateway(Env.PORT_SOCKET, {
  cors: { origin: '*' },
  maxHttpBufferSize: SOCKET_LIMITS.MAX_FRAME_BYTES,
})
export class SocketGateway
  implements
    OnGatewayInit<Server>,
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket>
{
  private readonly logger = new Logger(SOCKET_LOGGER_NAME.GATEWAY.SOCKET);

  constructor(
    @Inject(SOCKET_PROVIDER_TOKENS.SERVICES.CONNECTION)
    private readonly connection_service: IConnectionService,
    @Inject(SOCKET_PROVIDER_TOKENS.SERVICES.SOCKET)
    private readonly socket_service: ISocketService,
  ) {}

  afterInit(server: Server): void {
    this.connection_service.attach(server);
    this.socket_service.attach(server);

    server.use((socket, next) => {
      void this.authenticate(socket).then(next);
    });

    this.logger.info(`Socket listening on port ${Env.PORT_SOCKET}`);
  }

  async handleConnection(socket: Socket): Promise<void> {
    const connection = socket.data as TConnection | undefined;

    if (!connection?.kind) {
      socket.disconnect(true);
      return;
    }

    this.connection_service.track(
      socket.id,
      this.extractTokens(socket),
      connection,
    );

    await socket.join(this.connection_service.channels(connection));
  }

  handleDisconnect(socket: Socket): void {
    this.connection_service.untrack(socket.id);
  }

  //Functions
  private async authenticate(
    socket: Socket,
  ): Promise<TSocketError | undefined> {
    const connectionResult = await this.connection_service.authenticate(
      this.extractTokens(socket),
    );

    if (connectionResult.IsFailure) {
      const error: TSocketError = new Error(connectionResult.Error.message);
      error.data = {
        status: HttpErrorMapper.toStatus(connectionResult.Error.code),
        code: connectionResult.Error.message_code,
      };
      return error;
    }

    socket.data = connectionResult.Value;

    return undefined;
  }

  private extractTokens(socket: Socket): TConnectionTokens {
    return {
      access_token: this.extract(socket, SOCKET_HANDSHAKE_KEY.ACCESS_TOKEN),
      audience: this.extract(socket, SOCKET_HANDSHAKE_KEY.AUDIENCE),
    };
  }

  private extract(socket: Socket, key: THandshakeKey): string | null {
    const header = socket.handshake.headers[key];
    const auth = (socket.handshake.auth as Record<string, unknown>)[key];

    for (const value of [header, auth]) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }

    return null;
  }
}
