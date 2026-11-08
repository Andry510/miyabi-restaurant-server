import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import type { Server } from 'socket.io';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { IUserService } from '../../../../me/domain/interfaces/services';
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';
import type { IManagerSessionService } from '../../../../session/domain/interfaces/services';
import type { IConnectionService } from '../../../domain/interfaces/services';
import type {
  TConnection,
  TConnectionTokens,
} from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { ME_PROVIDER_TOKENS } from '../../../../me/infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';
import { SESSION_PROVIDER_TOKENS } from '../../../../session/infrastructure/constants';
import { API_SESSION_MESSAGE } from '../../../../session/api/messages';
import {
  SOCKET_AUDIENCE,
  SOCKET_CHANNEL,
  SOCKET_EVENT,
  SOCKET_LIMITS,
  SOCKET_LOGGER_NAME,
} from '../../../infrastructure/constants';

@Injectable()
export class ConnectionService
  implements
    IConnectionService,
    OnModuleInit,
    OnApplicationBootstrap,
    OnModuleDestroy
{
  private readonly logger = new Logger(SOCKET_LOGGER_NAME.SERVICE.CONNECTION);

  private io: Server | null = null;
  private readonly connections = new Map<
    string,
    { tokens: TConnectionTokens; connection: TConnection }
  >();

  private revalidateTimer: NodeJS.Timeout | null = null;
  private revalidating = false;

  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository_service: IRepositoryService,
    @Inject(ME_PROVIDER_TOKENS.SERVICES.USER)
    private readonly user_service: IUserService,
    @Inject(SESSION_PROVIDER_TOKENS.SERVICES.MANAGER)
    private readonly manager_session_service: IManagerSessionService,
  ) {}

  onModuleInit(): void {
    this.manager_session_service.onClosed((sessionIds) =>
      this.expireSessions(sessionIds),
    );
  }

  onApplicationBootstrap(): void {
    this.revalidateTimer = setInterval(
      () => void this.revalidate(),
      SOCKET_LIMITS.REVALIDATE_MS,
    );
    this.revalidateTimer.unref();
  }

  onModuleDestroy(): void {
    if (this.revalidateTimer) {
      clearInterval(this.revalidateTimer);
      this.revalidateTimer = null;
    }
  }

  attach(server: Server): void {
    this.io = server;
  }

  track(
    socketId: string,
    tokens: TConnectionTokens,
    connection: TConnection,
  ): void {
    this.connections.set(socketId, { tokens, connection });
  }

  untrack(socketId: string): void {
    this.connections.delete(socketId);
  }

  authenticate(
    tokens: TConnectionTokens,
  ): Promise<ResultPattern<TConnection, ServiceError>> {
    const accessToken = tokens.access_token;

    if (!accessToken) {
      return Promise.resolve(
        ServiceResultMapper.Unauthorized(
          API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN,
        ),
      );
    }

    return tokens.audience === SOCKET_AUDIENCE.MANAGER
      ? this.authenticateManager(accessToken)
      : this.authenticateEmployee(accessToken);
  }

  channels(connection: TConnection): string[] {
    if (connection.kind === 'employee') {
      return [SOCKET_CHANNEL.EMPLOYEE(connection.user_id)];
    }

    return connection.cloud_user_id
      ? [
          SOCKET_CHANNEL.MANAGERS,
          SOCKET_CHANNEL.MANAGER(connection.cloud_user_id),
        ]
      : [SOCKET_CHANNEL.MANAGERS];
  }

  //Functions
  private async authenticateEmployee(
    accessToken: string,
  ): Promise<ResultPattern<TConnection, ServiceError>> {
    const accessResult =
      await this.repository_service.validateAccess(accessToken);

    if (accessResult.IsFailure) {
      return ResultPattern.Failure(accessResult.Error);
    }

    return ResultPattern.Success({
      kind: 'employee',
      user_id: accessResult.Value.user.id,
    });
  }

  private async authenticateManager(
    sessionToken: string,
  ): Promise<ResultPattern<TConnection, ServiceError>> {
    const sessionResult = await this.manager_session_service.resolve(
      sessionToken,
      false,
    );

    if (sessionResult.IsFailure) {
      return ResultPattern.Failure(sessionResult.Error);
    }

    const { access_token: accessToken, email } = sessionResult.Value;

    const accessResult =
      await this.repository_service.validateManagerAccess(accessToken);

    if (accessResult.IsFailure) {
      return ResultPattern.Failure(accessResult.Error);
    }

    const userResult = await this.user_service.user(accessToken);

    return ResultPattern.Success({
      kind: 'manager',
      session_id: sessionResult.Value.id,
      email,
      cloud_user_id: userResult.IsSuccess ? userResult.Value.id : null,
    });
  }

  private async expiredReason(
    tokens: TConnectionTokens,
    connection: TConnection,
  ): Promise<string | null> {
    if (connection.kind === 'manager') {
      return (await this.manager_session_service.isActive(
        connection.session_id,
      ))
        ? null
        : API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_EXPIRED.code;
    }

    if (!tokens.access_token) {
      return API_MESSAGE_GLOBAL.ERROR.MISSING_TOKEN.code;
    }

    const accessResult = await this.repository_service.validateAccess(
      tokens.access_token,
    );

    return accessResult.IsFailure ? accessResult.Error.message_code : null;
  }

  private async revalidate(): Promise<void> {
    if (this.revalidating || !this.io) {
      return;
    }

    this.revalidating = true;

    try {
      const sockets = this.io.of('/').sockets;

      for (const [socketId, { tokens, connection }] of this.connections) {
        const socket = sockets.get(socketId);

        if (!socket) {
          this.untrack(socketId);
          continue;
        }

        const reason = await this.expiredReason(tokens, connection);

        if (reason) {
          this.expire(socketId, reason);
        }
      }
    } catch (error) {
      this.logger.error(error);
    } finally {
      this.revalidating = false;
    }
  }

  private expireSessions(sessionIds: string[]): void {
    const closed = new Set(sessionIds);

    for (const [socketId, { connection }] of this.connections) {
      if (connection.kind === 'manager' && closed.has(connection.session_id)) {
        this.expire(
          socketId,
          API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_EXPIRED.code,
        );
      }
    }
  }

  private expire(socketId: string, reason: string): void {
    const socket = this.io?.of('/').sockets.get(socketId);

    this.untrack(socketId);

    if (socket) {
      socket.emit(SOCKET_EVENT.SESSION_EXPIRED, { reason });
      socket.disconnect(true);
    }
  }
}
