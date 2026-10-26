import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ICloudAuthenticationRepository } from '../../../domain/interfaces/repositories';
import type { IAuthenticationService } from '../../../domain/interfaces/services';
import type { TLoginOutput } from '../../../domain/types/entities';
import type { TLoginInput } from '../../../domain/types/services';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_AUTHENTICATION)
    private readonly cloud_authentication_repository: ICloudAuthenticationRepository,
  ) {}

  login(
    input: TLoginInput,
  ): Promise<ResultPattern<TLoginOutput, ServiceError>> {
    return this.cloud_authentication_repository.login(input);
  }
}
