import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { ICloudAuthenticationRepository } from '../../../domain/interfaces/repositories';
import type { IMfaService } from '../../../domain/interfaces/services';
import type { TMfaCodeOutput } from '../../../domain/types/entities';
import type { TMfaCodeInput } from '../../../domain/types/services';
import type { IManagerSessionService } from '../../../../session/domain/interfaces/services';
import type { TWithSession } from '../../../../session/domain/types/entities';

//Infrastructure
import { AUTHENTICATION_PROVIDER_TOKENS } from '../../../infrastructure/constants';
import { SESSION_PROVIDER_TOKENS } from '../../../../session/infrastructure/constants';

@Injectable()
export class MfaService implements IMfaService {
  constructor(
    @Inject(AUTHENTICATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_AUTHENTICATION)
    private readonly cloud_authentication_repository: ICloudAuthenticationRepository,
    @Inject(SESSION_PROVIDER_TOKENS.SERVICES.MANAGER)
    private readonly manager_session_service: IManagerSessionService,
  ) {}

  qr(mfaToken: string): Promise<ResultPattern<string, ServiceError>> {
    return this.cloud_authentication_repository.mfaQr({
      authorization: mfaToken,
    });
  }

  async code(
    input: TMfaCodeInput,
    mfaToken: string,
  ): Promise<ResultPattern<TWithSession<TMfaCodeOutput>, ServiceError>> {
    const codeResult = await this.cloud_authentication_repository.mfaCode(
      input,
      { authorization: mfaToken },
    );

    if (codeResult.IsFailure) {
      return ResultPattern.Failure(codeResult.Error);
    }

    return this.manager_session_service.exchange(codeResult.Value, input);
  }
}
