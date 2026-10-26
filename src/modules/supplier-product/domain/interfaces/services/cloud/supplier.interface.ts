//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TSupplierProductsSchema } from '../../../schemas';
import type { TSupplierProductsOutput } from '../../../types/entities';

export interface ISupplierService {
  products(
    input: TSupplierProductsSchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TSupplierProductsOutput>, ServiceError>
  >;
}
