//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TProductParamSchema, TProductsQuerySchema } from '../../schemas';
import type { TProductOutput, TProductsOutput } from '../../types/entities';

export interface IProductService {
  products(
    input: TProductsQuerySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TPaginationService<TProductsOutput>, ServiceError>>;

  product(
    input: TProductParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TProductOutput, ServiceError>>;
}
