//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TLocationOutput } from '../../types/entities';

export interface ILocationService {
  location(
    accessToken: string | null,
  ): Promise<ResultPattern<TLocationOutput, ServiceError>>;
}
