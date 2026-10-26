import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ICloudMeRepository } from '../../domain/interfaces/repositories';
import type { ILocationService } from '../../domain/interfaces/services';
import type { TLocationOutput } from '../../domain/types/entities';

//Infrastructure
import { ME_PROVIDER_TOKENS } from '../../infrastructure/constants';

@Injectable()
export class LocationService implements ILocationService {
  constructor(
    @Inject(ME_PROVIDER_TOKENS.REPOSITORIES.CLOUD_ME)
    private readonly cloud_me_repository: ICloudMeRepository,
  ) {}

  location(
    accessToken: string | null,
  ): Promise<ResultPattern<TLocationOutput, ServiceError>> {
    return this.cloud_me_repository.location({ authorization: accessToken });
  }
}
