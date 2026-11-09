import { Inject, Injectable } from '@nestjs/common';

//Common
import { API_MESSAGE_GLOBAL, SYSTEM_MESSAGE } from '@common/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TClientInput } from '@domain/types/shared';
import type { SessionAggregate } from '../../../domain/aggregates';
import type { UserSession } from '../../../domain/entities';
import type { ISessionRepository } from '../../../domain/interfaces/repositories';
import type { ILocalSessionService } from '../../../domain/interfaces/services';
import type { TRefreshTokenOutput } from '../../../domain/types/entities';

//Infrastructure
import { Logger } from '@infrastructure/audits';
import { Env } from '@infrastructure/config';
import { SESSION_REVOCATION_ACTOR } from '@infrastructure/constants';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
// oxlint-disable-next-line typescript/consistent-type-imports
import { Argon2, JwtManager } from '@infrastructure/securities';
import {
  SESSION_LIMITS,
  SESSION_LOGGER_NAME,
  SESSION_PROVIDER_TOKENS,
} from '../../../infrastructure/constants';

//Api
import { API_SESSION_MESSAGE } from '../../../api/messages';

@Injectable()
export class LocalSessionService implements ILocalSessionService {
  private readonly logger = new Logger(SESSION_LOGGER_NAME.SERVICE.LOCAL);

  constructor(
    private readonly jwt_service: JwtManager,
    @Inject(SESSION_PROVIDER_TOKENS.REPOSITORIES.SESSION)
    private readonly session_repository: ISessionRepository,
  ) {}

  private async validateSession(
    userId: string,
    secretKey: string,
    onlyActive: boolean,
  ): Promise<ResultPattern<SessionAggregate, ServiceError>> {
    const sessionResult = onlyActive
      ? await this.session_repository.findActiveByUserAndKey(userId, secretKey)
      : await this.session_repository.findByUserAndKey(userId, secretKey);

    if (sessionResult.IsFailure) {
      this.logger.error(sessionResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!sessionResult.Value) {
      return ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.INVALID_REFRESH_TOKEN,
      );
    }

    return ServiceResultMapper.Ok(sessionResult.Value);
  }

  private async updateSession(
    session: UserSession,
  ): Promise<ResultPattern<void, ServiceError>> {
    const updateResult = await this.session_repository.update(session);

    if (updateResult.IsFailure) {
      this.logger.error(updateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    return ServiceResultMapper.Ok(undefined);
  }

  private async rejectStaleRefreshToken(
    sessionAggregate: SessionAggregate,
    refreshToken: string,
  ): Promise<ResultPattern<TRefreshTokenOutput, ServiceError>> {
    const previousHash = sessionAggregate.PreviousRefreshTokenHash;

    if (
      previousHash &&
      sessionAggregate.rotatedWithin(SESSION_LIMITS.ROTATION_GRACE_MS)
    ) {
      const isPreviousResult = await Argon2.verify(previousHash, refreshToken);

      if (isPreviousResult.IsFailure) {
        this.logger.error(isPreviousResult.Error);
        return ServiceResultMapper.InternalServerError();
      }

      if (isPreviousResult.Value) {
        return ServiceResultMapper.Conflict(
          API_SESSION_MESSAGE.ERROR.REFRESH_TOKEN_ROTATED,
        );
      }
    }

    this.logger.warn(SYSTEM_MESSAGE.ERROR.REFRESH_TOKEN_REUSED);

    sessionAggregate.revoke(SESSION_REVOCATION_ACTOR.SYSTEM);

    const updateResult = await this.updateSession(sessionAggregate.Session);

    if (updateResult.IsFailure) {
      return ResultPattern.Failure(updateResult.Error);
    }

    return ServiceResultMapper.Unauthorized(
      API_SESSION_MESSAGE.ERROR.REFRESH_TOKEN_REUSED,
    );
  }

  async refreshToken(
    input: TClientInput,
    refreshToken: string,
  ): Promise<ResultPattern<TRefreshTokenOutput, ServiceError>> {
    const verifyTokenResult =
      await this.jwt_service.verifyRefreshTokenIgnoringExpiration(refreshToken);

    if (verifyTokenResult.IsFailure) {
      this.logger.error(verifyTokenResult.Error);
      return ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.INVALID_REFRESH_TOKEN,
      );
    }

    const tokenPolicy = verifyTokenResult.Value;

    const sessionResult = await this.validateSession(
      tokenPolicy.Payload.user_id,
      tokenPolicy.Payload.session_key,
      true,
    );

    if (sessionResult.IsFailure) {
      return ResultPattern.Failure(sessionResult.Error);
    }

    const sessionAggregate = sessionResult.Value;

    const isMatchRefreshTokenResult = await Argon2.verify(
      sessionAggregate.RefreshTokenHash,
      refreshToken,
    );

    if (isMatchRefreshTokenResult.IsFailure) {
      this.logger.error(isMatchRefreshTokenResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!isMatchRefreshTokenResult.Value) {
      return this.rejectStaleRefreshToken(sessionAggregate, refreshToken);
    }

    if (tokenPolicy.IsExpired || sessionAggregate.IsExpired) {
      sessionAggregate.expire();

      const updateResult = await this.updateSession(sessionAggregate.Session);

      if (updateResult.IsFailure) {
        return ResultPattern.Failure(updateResult.Error);
      }

      return ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.EXPIRED_REFRESH_TOKEN,
      );
    }

    const isValidDevice = sessionAggregate.verifyDevice(input.device);
    const isValidBrowser = sessionAggregate.verifyBrowser(input.browser);

    if (!isValidDevice || !isValidBrowser) {
      this.logger.warn(SYSTEM_MESSAGE.ERROR.INVALID_DEVICE_OR_BROWSER);

      sessionAggregate.revoke(SESSION_REVOCATION_ACTOR.SYSTEM);

      const updateResult = await this.updateSession(sessionAggregate.Session);

      if (updateResult.IsFailure) {
        return ResultPattern.Failure(updateResult.Error);
      }

      return ServiceResultMapper.Unauthorized();
    }

    if (!sessionAggregate.verifyRequesterIp(input.requester_ip)) {
      this.logger.warn(SYSTEM_MESSAGE.ERROR.IP_CHANGED(input.requester_ip));

      sessionAggregate.setRequestIp(input.requester_ip);
    }

    const accessTokenResult = await this.jwt_service.generateToken({
      email: sessionAggregate.Email,
      session_key: sessionAggregate.SecretKey,
    });

    if (accessTokenResult.IsFailure) {
      this.logger.error(accessTokenResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const refreshTokenResult = await this.jwt_service.generateRefreshToken({
      user_id: sessionAggregate.UserId,
      session_key: sessionAggregate.SecretKey,
    });

    if (refreshTokenResult.IsFailure) {
      this.logger.error(refreshTokenResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const hashRefreshTokenResult = await Argon2.hash(refreshTokenResult.Value);

    if (hashRefreshTokenResult.IsFailure) {
      this.logger.error(hashRefreshTokenResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    const currentHash = sessionAggregate.RefreshTokenHash;

    if (sessionAggregate.WillExpireWithin24Hours) {
      sessionAggregate.renewExpiration(Env.SESSION_EXPIRES_MS);
    }

    sessionAggregate.rotateRefreshTokenHash(hashRefreshTokenResult.Value);

    const rotateResult = await this.session_repository.updateIfRefreshTokenHash(
      sessionAggregate.Session,
      currentHash,
    );

    if (rotateResult.IsFailure) {
      this.logger.error(rotateResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!rotateResult.Value) {
      return ServiceResultMapper.Conflict(
        API_SESSION_MESSAGE.ERROR.REFRESH_TOKEN_ROTATED,
      );
    }

    return ServiceResultMapper.Ok({
      access_token: accessTokenResult.Value,
      refresh_token: refreshTokenResult.Value,
    });
  }

  async logout(
    refreshToken: string,
  ): Promise<ResultPattern<null, ServiceError>> {
    const verifyTokenResult =
      await this.jwt_service.verifyRefreshTokenIgnoringExpiration(refreshToken);

    if (verifyTokenResult.IsFailure) {
      this.logger.error(verifyTokenResult.Error);
      return ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.INVALID_REFRESH_TOKEN,
      );
    }

    const { user_id, session_key } = verifyTokenResult.Value.Payload;

    const sessionResult = await this.validateSession(
      user_id,
      session_key,
      false,
    );

    if (sessionResult.IsFailure) {
      return ResultPattern.Failure(sessionResult.Error);
    }

    const sessionAggregate = sessionResult.Value;

    const isMatchRefreshTokenResult = await Argon2.verify(
      sessionAggregate.RefreshTokenHash,
      refreshToken,
    );

    if (isMatchRefreshTokenResult.IsFailure) {
      this.logger.error(isMatchRefreshTokenResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!isMatchRefreshTokenResult.Value) {
      return ServiceResultMapper.Unauthorized();
    }

    sessionAggregate.revoke(SESSION_REVOCATION_ACTOR.USER(user_id));

    const updateResult = await this.updateSession(sessionAggregate.Session);

    if (updateResult.IsFailure) {
      return ResultPattern.Failure(updateResult.Error);
    }

    return ServiceResultMapper.Ok(null);
  }
}
