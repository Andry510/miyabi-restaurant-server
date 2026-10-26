//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TLocalProductsQuerySchema } from '../../../schemas';
import type { TLocalProductOutput } from '../../../types/entities';

export interface IProductRepository {
  findManyByWorkArea(
    input: TLocalProductsQuerySchema,
    workAreaId: string,
  ): Promise<ResultPattern<TPaginationRepository<TLocalProductOutput>>>;
}
