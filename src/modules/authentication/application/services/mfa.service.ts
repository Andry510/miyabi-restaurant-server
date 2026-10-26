import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ICloudAuthenticationRepository } from '../../domain/interfaces/repositories';
import type { IMfaService } from '../../domain/interfaces/services';
import type { TMfaCodeOutput } from '../../domain/types/entities';
import type { TMfaCodeInput } from '../../domain/types/services';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../infrastructure/constants';

@Injectable()
export class MfaService implements IMfaService {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_AUTHENTICATION)
    private readonly cloud_authentication_repository: ICloudAuthenticationRepository,
  ) {}

  qr(mfaToken: string): Promise<ResultPattern<string, ServiceError>> {
    return this.cloud_authentication_repository.mfaQr({
      authorization: mfaToken,
    });
  }

  code(
    input: TMfaCodeInput,
    mfaToken: string,
  ): Promise<ResultPattern<TMfaCodeOutput, ServiceError>> {
    return this.cloud_authentication_repository.mfaCode(input, {
      authorization: mfaToken,
    });
  }
}
