import { Inject, Injectable } from '@nestjs/common';

//Common
import { API_MESSAGE_GLOBAL } from '@common/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type {
  ICloudSessionRepository,
  IUserSessionRepository,
} from '../../domain/interfaces/repositories';
import type { IRepositoryService } from '../../domain/interfaces/services';
import type { TValidateAccessOutput } from '../../domain/types';

//Infrastructure
import { Logger } from '@infrastructure/audits';
// oxlint-disable-next-line typescript/consistent-type-imports
import { RedisManager } from '@infrastructure/cache';
import { CACHE_KEY } from '@infrastructure/constants';
import { Env } from '@infrastructure/config';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
// oxlint-disable-next-line typescript/consistent-type-imports
import { Crypto, JwtManager } from '@infrastructure/securities';
import { TokenPayload } from '@infrastructure/utils';
import {
  REPOSITORY_LOGGER_NAME,
  REPOSITORY_PROVIDER_TOKENS,
} from '../../infrastructure/constants';

@Injectable()
export class RepositoryService implements IRepositoryService {
  private readonly logger = new Logger(
    REPOSITORY_LOGGER_NAME.SERVICE.REPOSITORY,
  );

  constructor(
    private readonly jwt_service: JwtManager,
    private readonly cache: RedisManager,
    @Inject(REPOSITORY_PROVIDER_TOKENS.REPOSITORIES.USER_SESSION)
    private readonly user_session_repository: IUserSessionRepository,
    @Inject(REPOSITORY_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SESSION)
    private readonly cloud_session_repository: ICloudSessionRepository,
  ) {}

  serverToken(): ResultPattern<string, ServiceError> {
    if (!Env.SERVER_TOKEN) {
      return ServiceResultMapper.Conflict(
        API_MESSAGE_GLOBAL.ERROR.SERVER_NOT_PAIRED,
      );
    }

    return ServiceResultMapper.Ok(Env.SERVER_TOKEN);
  }

  async validateAccess(
    accessToken: string,
  ): Promise<ResultPattern<TValidateAccessOutput, ServiceError>> {
    const verifyAccessTokenResult =
      await this.jwt_service.verifyTokenIgnoringExpiration(accessToken);

    if (verifyAccessTokenResult.IsFailure) {
      this.logger.error(verifyAccessTokenResult.Error);
      return ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.INVALID_ACCESS_TOKEN,
      );
    }

    const accessTokenPolicy = verifyAccessTokenResult.Value;

    if (accessTokenPolicy.IsExpired) {
      return ServiceResultMapper.Unauthorized(
        API_MESSAGE_GLOBAL.ERROR.EXPIRED_TOKEN,
      );
    }

    const { email, session_key } = accessTokenPolicy.Payload;

    const userResult =
      await this.user_session_repository.findOneByEmailAndSession(
        email,
        session_key,
      );

    if (userResult.IsFailure) {
      this.logger.error(userResult.Error);
      return ServiceResultMapper.InternalServerError();
    }

    if (!userResult.Value) {
      return ServiceResultMapper.Unauthorized();
    }

    const userAggregate = userResult.Value;

    if (!userAggregate.IsActive) {
      return ServiceResultMapper.Unauthorized();
    }

    return ResultPattern.Success({ user: userAggregate.UserDetail });
  }

  async validateManagerAccess(
    accessToken: string,
  ): Promise<ResultPattern<null, ServiceError>> {
    const key = CACHE_KEY.MANAGER_SESSION(Crypto.sha256(accessToken));

    if (await this.cache.get<true>(key)) {
      return ServiceResultMapper.Ok(null);
    }

    const validateResult = await this.cloud_session_repository.validate({
      authorization: accessToken,
    });

    const sessionKey = TokenPayload.sessionKey(accessToken);
    const ttlSeconds =
      (TokenPayload.expiresAt(accessToken) ?? 0) -
      Math.floor(Date.now() / 1000);

    if (validateResult.IsSuccess && sessionKey && ttlSeconds > 0) {
      await this.cache.set(
        key,
        true,
        ttlSeconds,
        CACHE_KEY.MANAGER_SESSION_GROUP(sessionKey),
      );
    }

    return validateResult;
  }

  forgetManagerSession(sessionKey: string): Promise<void> {
    return this.cache.forgetGroup(CACHE_KEY.MANAGER_SESSION_GROUP(sessionKey));
  }
}
