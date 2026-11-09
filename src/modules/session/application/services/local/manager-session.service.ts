import { randomBytes } from 'crypto';
import {
  Inject,
  Injectable,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from '@nestjs/common';

//Api
import { API_SESSION_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TApiMessage, TClientInput } from '@domain/types/shared';
import type {
  ICloudSessionRepository,
  IManagerSessionRepository,
} from '../../../domain/interfaces/repositories';
import type { IManagerSessionService } from '../../../domain/interfaces/services';
import type {
  TManagerSession,
  TManagerSessionRow,
  TManagerSessionTokens,
  TRefreshTokenOutput,
  TSessionClosedHandler,
  TWithSession,
} from '../../../domain/types/entities';
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Crypto } from '@infrastructure/securities';
import { TokenPayload } from '@infrastructure/utils';
import {
  MANAGER_SESSION_LIMITS,
  MANAGER_SESSION_PREFIX,
  SESSION_LOGGER_NAME,
  SESSION_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';

@Injectable()
export class ManagerSessionService
  implements IManagerSessionService, OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(SESSION_LOGGER_NAME.SERVICE.MANAGER);
  private readonly refreshing = new Map<
    string,
    Promise<ResultPattern<string, ServiceError>>
  >();
  private readonly handlers: TSessionClosedHandler[] = [];
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(SESSION_PROVIDER_TOKENS.REPOSITORIES.MANAGER_SESSION)
    private readonly manager_session_repository: IManagerSessionRepository,
    @Inject(SESSION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SESSION)
    private readonly cloud_session_repository: ICloudSessionRepository,
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository_service: IRepositoryService,
  ) {}

  onApplicationBootstrap(): void {
    this.cleanupTimer = setInterval(
      () => void this.cleanup(),
      MANAGER_SESSION_LIMITS.CLEANUP_MS,
    );
    this.cleanupTimer.unref();
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  owns(token: string | null): boolean {
    return token?.startsWith(MANAGER_SESSION_PREFIX) ?? false;
  }

  async open(
    tokens: TRefreshTokenOutput,
    client: TClientInput,
  ): Promise<ResultPattern<string, ServiceError>> {
    const email = TokenPayload.email(tokens.access_token);
    const sessionTokensResult = this.encryptTokens(tokens);

    if (!email || sessionTokensResult.IsFailure) {
      return ServiceResultMapper.InternalServerError();
    }

    const sessionToken =
      MANAGER_SESSION_PREFIX +
      randomBytes(MANAGER_SESSION_LIMITS.TOKEN_BYTES).toString('base64url');

    const createResult = await this.manager_session_repository.create({
      ...sessionTokensResult.Value,
      token_hash: Crypto.sha256(sessionToken),
      email,
      requester_ip: client.requester_ip,
      device: client.device,
      browser: client.browser,
    });

    if (createResult.IsFailure) {
      this.logger.error(createResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(sessionToken);
  }

  async exchange<T extends { access?: TRefreshTokenOutput }>(
    value: T,
    client: TClientInput,
  ): Promise<ResultPattern<TWithSession<T>, ServiceError>> {
    const { access, ...rest } = value;

    if (!access) {
      return ServiceResultMapper.Ok(rest as TWithSession<T>);
    }

    const openResult = await this.open(access, client);

    if (openResult.IsFailure) {
      return ResultPattern.Failure(openResult.Error);
    }

    return ServiceResultMapper.Ok({
      ...rest,
      access: { session_token: openResult.Value },
    } as unknown as TWithSession<T>);
  }

  async resolve(
    sessionToken: string,
    touch: boolean = true,
  ): Promise<ResultPattern<TManagerSession, ServiceError>> {
    const rowResult = this.owns(sessionToken)
      ? await this.manager_session_repository.findByHash(
          Crypto.sha256(sessionToken),
        )
      : null;

    if (rowResult?.IsFailure) {
      this.logger.error(rowResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const row = rowResult?.Value;

    if (!row) {
      return ServiceResultMapper.Unauthorized(
        API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_INVALID,
      );
    }

    const now = Date.now();

    if (now - row.last_access_at.getTime() > MANAGER_SESSION_LIMITS.IDLE_MS) {
      await this.discard(row);
      return ServiceResultMapper.Unauthorized(
        API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_EXPIRED,
      );
    }

    const accessResult =
      row.access_expires_at.getTime() -
        MANAGER_SESSION_LIMITS.REFRESH_MARGIN_MS >
      now
        ? this.decrypt(row.access_token_enc)
        : await this.refresh(row);

    if (accessResult.IsFailure) {
      return ResultPattern.Failure(accessResult.Error);
    }

    if (
      touch &&
      now - row.last_access_at.getTime() > MANAGER_SESSION_LIMITS.TOUCH_MS
    ) {
      void this.manager_session_repository.touch(row.id);
    }

    return ServiceResultMapper.Ok({
      id: row.id,
      email: row.email,
      cloud_session_key: row.cloud_session_key,
      access_token: accessResult.Value,
    });
  }

  async isActive(sessionId: string): Promise<boolean> {
    const lastAccessResult =
      await this.manager_session_repository.findLastAccess(sessionId);

    if (lastAccessResult.IsFailure) {
      this.logger.error(lastAccessResult.Error);
      return true;
    }

    const lastAccess = lastAccessResult.Value;

    return (
      lastAccess !== null &&
      Date.now() - lastAccess.getTime() <= MANAGER_SESSION_LIMITS.IDLE_MS
    );
  }

  async close(
    sessionToken: string,
  ): Promise<ResultPattern<null, ServiceError>> {
    const rowResult = this.owns(sessionToken)
      ? await this.manager_session_repository.findByHash(
          Crypto.sha256(sessionToken),
        )
      : null;

    if (rowResult?.IsFailure) {
      this.logger.error(rowResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const row = rowResult?.Value;

    if (!row) {
      return ServiceResultMapper.Ok(null);
    }

    return (await this.discard(row))
      ? ServiceResultMapper.Ok(null)
      : ServiceResultMapper.InternalServerError();
  }

  async revoke(cloudSessionKey: string): Promise<void> {
    const deleteResult =
      await this.manager_session_repository.deleteByCloudSessionKey(
        cloudSessionKey,
      );

    if (deleteResult.IsFailure) {
      this.logger.error(deleteResult.Error);
      return;
    }

    await this.notifyClosed(
      deleteResult.Value,
      API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_REVOKED,
    );
  }

  onClosed(handler: TSessionClosedHandler): void {
    this.handlers.push(handler);
  }

  //Functions
  private async discard(row: TManagerSessionRow): Promise<boolean> {
    const refreshResult = this.decrypt(row.refresh_token_enc);

    if (refreshResult.IsSuccess) {
      await this.cloud_session_repository.logout({
        authorization: refreshResult.Value,
      });
    }

    const deleteResult = await this.manager_session_repository.deleteById(
      row.id,
    );

    if (deleteResult.IsFailure) {
      this.logger.error(deleteResult.Error);
      return false;
    }

    await this.repository_service.forgetManagerSession(row.cloud_session_key);
    await this.notifyClosed(
      [row.id],
      API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_EXPIRED,
    );

    return true;
  }

  private async notifyClosed(
    sessionIds: string[],
    reason: TApiMessage,
  ): Promise<void> {
    if (!sessionIds.length) {
      return;
    }

    for (const handler of this.handlers) {
      try {
        await handler(sessionIds, reason);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private refresh(
    row: TManagerSessionRow,
  ): Promise<ResultPattern<string, ServiceError>> {
    const running = this.refreshing.get(row.id);

    if (running) {
      return running;
    }

    const refreshing = this.runRefresh(row).finally(() =>
      this.refreshing.delete(row.id),
    );
    this.refreshing.set(row.id, refreshing);

    return refreshing;
  }

  private async runRefresh(
    row: TManagerSessionRow,
  ): Promise<ResultPattern<string, ServiceError>> {
    const refreshTokenResult = this.decrypt(row.refresh_token_enc);

    if (refreshTokenResult.IsFailure) {
      return refreshTokenResult;
    }

    const refreshResult = await this.cloud_session_repository.refreshToken(
      {
        requester_ip: row.requester_ip ?? '',
        device: row.device ?? '',
        browser: row.browser ?? '',
      },
      { authorization: refreshTokenResult.Value },
    );

    if (refreshResult.IsFailure) {
      if (refreshResult.Error.code !== 'UNAUTHORIZED') {
        return ResultPattern.Failure(refreshResult.Error);
      }

      await this.manager_session_repository.deleteById(row.id);
      await this.notifyClosed(
        [row.id],
        API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_EXPIRED,
      );
      return ServiceResultMapper.Unauthorized(
        API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_EXPIRED,
      );
    }

    const sessionTokensResult = this.encryptTokens(refreshResult.Value);

    if (sessionTokensResult.IsFailure) {
      return ServiceResultMapper.InternalServerError();
    }

    const updateResult = await this.manager_session_repository.updateTokens(
      row.id,
      sessionTokensResult.Value,
    );

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(refreshResult.Value.access_token);
  }

  private encryptTokens(
    tokens: TRefreshTokenOutput,
  ): ResultPattern<TManagerSessionTokens> {
    const sessionKey = TokenPayload.sessionKey(tokens.access_token);
    const expiresAt = TokenPayload.expiresAt(tokens.access_token);
    const accessResult = Crypto.encrypt(tokens.access_token);
    const refreshResult = Crypto.encrypt(tokens.refresh_token);

    if (accessResult.IsFailure || refreshResult.IsFailure) {
      this.logger.error(
        accessResult.IsFailure ? accessResult.Error : refreshResult.Error,
      );
      return ResultPattern.Failure(
        accessResult.IsFailure ? accessResult.Error : refreshResult.Error,
      );
    }

    if (!sessionKey || !expiresAt) {
      return ResultPattern.Failure(
        ServiceResultMapper.InternalServerError().Error,
      );
    }

    return ResultPattern.Success({
      cloud_session_key: sessionKey,
      access_token_enc: accessResult.Value,
      refresh_token_enc: refreshResult.Value,
      access_expires_at: new Date(expiresAt * 1000),
    });
  }

  private decrypt(value: string): ResultPattern<string, ServiceError> {
    const decryptResult = Crypto.decrypt(value);

    if (decryptResult.IsFailure) {
      this.logger.error(decryptResult.Error);
      return ServiceResultMapper.Unauthorized(
        API_SESSION_MESSAGE.ERROR.MANAGER_SESSION_INVALID,
      );
    }

    return ServiceResultMapper.Ok(decryptResult.Value);
  }

  private async cleanup(): Promise<void> {
    const idleResult = await this.manager_session_repository.findIdle(
      new Date(Date.now() - MANAGER_SESSION_LIMITS.IDLE_MS),
    );

    if (idleResult.IsFailure) {
      this.logger.error(idleResult.Error);
      return;
    }

    for (const row of idleResult.Value) {
      await this.discard(row);
    }
  }
}
