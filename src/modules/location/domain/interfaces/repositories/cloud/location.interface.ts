//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens, TPaginationService } from '@domain/types/shared';
import type { TLocationsQuerySchema } from '../../../schemas';
import type { TLocationsOutput } from '../../../types/entities';

export interface ICloudLocationRepository {
  locations(
    input: TLocationsQuerySchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TPaginationService<TLocationsOutput>, ServiceError>>;
}
