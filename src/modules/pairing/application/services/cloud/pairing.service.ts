import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';

//Api
import { API_PAIRING_MESSAGE } from '../../../api/messages';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { ICloudServerRepository } from '../../../domain/interfaces/repositories';
import type { IPairingService } from '../../../domain/interfaces/services';
import type { TRegisterSchema } from '../../../domain/schemas';
import type { TRegisterOutput } from '../../../domain/types/entities';
import type { TCloudRegisterInput } from '../../../domain/types/services';
import type { IRepositoryService } from '../../../../repository/domain/interfaces/services';

//Infrastructure
import { SERVER_VERSION } from '@infrastructure/constants';
import { ServiceResultMapper } from '@infrastructure/mappers/shared';
import { Machine } from '@infrastructure/utils';
import { PAIRING_PROVIDER_TOKENS } from '../../../infrastructure/constants';
import { REPOSITORY_PROVIDER_TOKENS } from '../../../../repository/infrastructure/constants';

@Injectable()
export class PairingService implements IPairingService {
  constructor(
    @Inject(REPOSITORY_PROVIDER_TOKENS.SERVICES.REPOSITORY)
    private readonly repository_service: IRepositoryService,
    @Inject(PAIRING_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SERVER)
    private readonly cloud_server_repository: ICloudServerRepository,
  ) {}

  async register(
    input: TRegisterSchema,
  ): Promise<ResultPattern<TRegisterOutput, ServiceError>> {
    const tokenResult = this.repository_service.serverToken();

    if (tokenResult.IsSuccess) {
      return ServiceResultMapper.Conflict(
        API_PAIRING_MESSAGE.ERROR.ALREADY_PAIRED,
      );
    }

    const macAddress = Machine.macAddress();

    const data: TCloudRegisterInput = {
      name: input.name,
      version: SERVER_VERSION,
      instance_id: randomUUID(),
      platform: Machine.platform(),
      ...(macAddress && { mac_address: macAddress }),
    };

    const registerResult = await this.cloud_server_repository.register(
      data,
      input.enrollment_token,
    );

    if (registerResult.IsFailure) {
      return ResultPattern.Failure(registerResult.Error);
    }

    return ServiceResultMapper.Ok({
      name: data.name,
      server_token: registerResult.Value,
    });
  }
}
