//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudServerProductsOutput } from '../../../types/services';

export interface ICloudServerProductRepository {
  serverProducts(
    updatedSince: Date | null,
  ): Promise<ResultPattern<TCloudServerProductsOutput, ServiceError>>;
}
