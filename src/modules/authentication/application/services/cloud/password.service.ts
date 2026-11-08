import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { ICloudAuthenticationRepository } from '../../../domain/interfaces/repositories';
import type { IPasswordService } from '../../../domain/interfaces/services';
import type { TResetPasswordOutput } from '../../../domain/types/entities';
import type { TResetPasswordInput } from '../../../domain/types/services';
import type { IManagerSessionService } from '../../../../session/domain/interfaces/services';
import type { TWithSession } from '../../../../session/domain/types/entities';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../../infrastructure/constants';
import { SESSION_PROVIDER_TOKENS } from '../../../../session/infrastructure/constants';

@Injectable()
export class PasswordService implements IPasswordService {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_AUTHENTICATION)
    private readonly cloud_authentication_repository: ICloudAuthenticationRepository,
    @Inject(SESSION_PROVIDER_TOKENS.SERVICES.MANAGER)
    private readonly manager_session_service: IManagerSessionService,
  ) {}

  async reset(
    input: TResetPasswordInput,
    passwordToken: string,
  ): Promise<ResultPattern<TWithSession<TResetPasswordOutput>, ServiceError>> {
    const resetResult =
      await this.cloud_authentication_repository.resetPassword(input, {
        authorization: passwordToken,
      });

    if (resetResult.IsFailure) {
      return ResultPattern.Failure(resetResult.Error);
    }

    return this.manager_session_service.exchange(resetResult.Value, input);
  }
}
