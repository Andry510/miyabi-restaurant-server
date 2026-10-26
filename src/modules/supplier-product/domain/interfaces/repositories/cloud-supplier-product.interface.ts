//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens, TPaginationService } from '@domain/types/shared';
import type {
  TProductSuppliersSchema,
  TSupplierProductParamSchema,
  TSupplierProductsSchema,
} from '../../schemas';
import type {
  TProductSuppliersOutput,
  TSupplierProductOutput,
  TSupplierProductsOutput,
} from '../../types/entities';

export interface ICloudSupplierProductRepository {
  supplierProduct(
    input: TSupplierProductParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TSupplierProductOutput, ServiceError>>;

  supplierProducts(
    input: TSupplierProductsSchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TSupplierProductsOutput>, ServiceError>
  >;

  productSuppliers(
    input: TProductSuppliersSchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TProductSuppliersOutput>, ServiceError>
  >;
}
