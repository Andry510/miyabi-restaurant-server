import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { ICloudAuthenticationRepository } from '../../../domain/interfaces/repositories';
import type { IAuthenticationService } from '../../../domain/interfaces/services';
import type { TLoginOutput } from '../../../domain/types/entities';
import type { TLoginInput } from '../../../domain/types/services';
import type { IManagerSessionService } from '../../../../session/domain/interfaces/services';
import type { TWithSession } from '../../../../session/domain/types/entities';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../../infrastructure/constants';
import { SESSION_PROVIDER_TOKENS } from '../../../../session/infrastructure/constants';

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_AUTHENTICATION)
    private readonly cloud_authentication_repository: ICloudAuthenticationRepository,
    @Inject(SESSION_PROVIDER_TOKENS.SERVICES.MANAGER)
    private readonly manager_session_service: IManagerSessionService,
  ) {}

  async login(
    input: TLoginInput,
  ): Promise<ResultPattern<TWithSession<TLoginOutput>, ServiceError>> {
    const loginResult = await this.cloud_authentication_repository.login(input);

    if (loginResult.IsFailure) {
      return ResultPattern.Failure(loginResult.Error);
    }

    return this.manager_session_service.exchange(loginResult.Value, input);
  }
}
