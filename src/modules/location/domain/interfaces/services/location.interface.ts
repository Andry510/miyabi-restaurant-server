//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TLocationsQuerySchema } from '../../schemas';
import type { TLocationsOutput } from '../../types/entities';

export interface ILocationService {
  locations(
    input: TLocationsQuerySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TPaginationService<TLocationsOutput>, ServiceError>>;
}
