//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TSupplierProductParamSchema } from '../../../schemas';
import type { TSupplierProductOutput } from '../../../types/entities';

export interface ISupplierProductService {
  supplierProduct(
    input: TSupplierProductParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TSupplierProductOutput, ServiceError>>;
}
