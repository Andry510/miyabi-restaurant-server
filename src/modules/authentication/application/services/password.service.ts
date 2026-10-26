import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ICloudAuthenticationRepository } from '../../domain/interfaces/repositories';
import type { IPasswordService } from '../../domain/interfaces/services';
import type { TResetPasswordOutput } from '../../domain/types/entities';
import type { TResetPasswordInput } from '../../domain/types/services';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../infrastructure/constants';

@Injectable()
export class PasswordService implements IPasswordService {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_AUTHENTICATION)
    private readonly cloud_authentication_repository: ICloudAuthenticationRepository,
  ) {}

  reset(
    input: TResetPasswordInput,
    passwordToken: string,
  ): Promise<ResultPattern<TResetPasswordOutput, ServiceError>> {
    return this.cloud_authentication_repository.resetPassword(input, {
      authorization: passwordToken,
    });
  }
}
