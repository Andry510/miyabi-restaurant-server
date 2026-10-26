//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  TSupplierParamSchema,
  TSuppliersQuerySchema,
} from '../../../schemas';
import type {
  TSupplierOutput,
  TSuppliersOutput,
} from '../../../types/entities';

export interface ISupplierService {
  suppliers(
    input: TSuppliersQuerySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TPaginationService<TSuppliersOutput>, ServiceError>>;

  supplier(
    input: TSupplierParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TSupplierOutput, ServiceError>>;
}
