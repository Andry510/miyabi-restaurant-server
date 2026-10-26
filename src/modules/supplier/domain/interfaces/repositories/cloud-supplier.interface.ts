//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens, TPaginationService } from '@domain/types/shared';
import type {
  TSupplierParamSchema,
  TSuppliersQuerySchema,
} from '../../schemas';
import type { TSupplierOutput, TSuppliersOutput } from '../../types/entities';

export interface ICloudSupplierRepository {
  suppliers(
    input: TSuppliersQuerySchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TPaginationService<TSuppliersOutput>, ServiceError>>;

  supplier(
    input: TSupplierParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TSupplierOutput, ServiceError>>;
}
