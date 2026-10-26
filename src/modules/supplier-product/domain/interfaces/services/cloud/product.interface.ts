//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TProductSuppliersSchema } from '../../../schemas';
import type { TProductSuppliersOutput } from '../../../types/entities';

export interface IProductService {
  suppliers(
    input: TProductSuppliersSchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TProductSuppliersOutput>, ServiceError>
  >;
}
