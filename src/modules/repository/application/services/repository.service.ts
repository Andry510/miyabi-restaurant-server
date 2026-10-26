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
import { Env } from '@infrastructure/config';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
// oxlint-disable-next-line typescript/consistent-type-imports
import { JwtManager } from '@infrastructure/securities';
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

  validateManagerAccess(
    accessToken: string,
  ): Promise<ResultPattern<null, ServiceError>> {
    return this.cloud_session_repository.validate({
      authorization: accessToken,
    });
  }
}
