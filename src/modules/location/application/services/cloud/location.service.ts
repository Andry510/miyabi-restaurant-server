import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { ICloudLocationRepository } from '../../../domain/interfaces/repositories';
import type { ILocationService } from '../../../domain/interfaces/services';
import type { TLocationsQuerySchema } from '../../../domain/schemas';
import type { TLocationsOutput } from '../../../domain/types/entities';

//Infrastructure
import { LOCATION_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Injectable()
export class LocationService implements ILocationService {
  constructor(
    @Inject(LOCATION_PROVIDER_TOKENS.REPOSITORIES.CLOUD_LOCATION)
    private readonly cloud_location_repository: ICloudLocationRepository,
  ) {}

  locations(
    input: TLocationsQuerySchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TLocationsOutput>, ServiceError>
  > {
    return this.cloud_location_repository.locations(input, {
      authorization: accessToken,
    });
  }
}
