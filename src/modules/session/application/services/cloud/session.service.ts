import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TClientInput } from '@domain/types/shared';
import type { ICloudSessionRepository } from '../../../domain/interfaces/repositories';
import type { ISessionService } from '../../../domain/interfaces/services';
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';
import type { TRefreshTokenOutput } from '../../../domain/types/entities';

//Infrastructure
import { TokenPayload } from '@infrastructure/utils';
import { SESSION_PROVIDER_TOKENS } from '../../../infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';

@Injectable()
export class SessionService implements ISessionService {
  constructor(
    @Inject(SESSION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SESSION)
    private readonly cloud_session_repository: ICloudSessionRepository,
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository_service: IRepositoryService,
  ) {}

  refreshToken(
    input: TClientInput,
    refreshToken: string,
  ): Promise<ResultPattern<TRefreshTokenOutput, ServiceError>> {
    return this.cloud_session_repository.refreshToken(input, {
      authorization: refreshToken,
    });
  }

  async logout(
    refreshToken: string,
  ): Promise<ResultPattern<null, ServiceError>> {
    const logoutResult = await this.cloud_session_repository.logout({
      authorization: refreshToken,
    });
    const sessionKey = TokenPayload.sessionKey(refreshToken);

    if (logoutResult.IsSuccess && sessionKey) {
      await this.repository_service.forgetManagerSession(sessionKey);
    }

    return logoutResult;
  }
}
