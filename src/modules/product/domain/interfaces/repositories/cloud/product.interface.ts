//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens, TPaginationService } from '@domain/types/shared';
import type {
  TProductParamSchema,
  TProductsQuerySchema,
} from '../../../schemas';
import type { TProductOutput, TProductsOutput } from '../../../types/entities';

export interface ICloudProductRepository {
  products(
    input: TProductsQuerySchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TPaginationService<TProductsOutput>, ServiceError>>;

  product(
    input: TProductParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TProductOutput, ServiceError>>;
}
