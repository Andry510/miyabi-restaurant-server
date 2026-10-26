import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { ICloudSupplierProductRepository } from '../../domain/interfaces/repositories';
import type { ISupplierService } from '../../domain/interfaces/services';
import type { TSupplierProductsSchema } from '../../domain/schemas';
import type { TSupplierProductsOutput } from '../../domain/types/entities';

//Infrastructure
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../../infrastructure/constants';

@Injectable()
export class SupplierService implements ISupplierService {
  constructor(
    @Inject(
      SUPPLIER_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SUPPLIER_PRODUCT,
    )
    private readonly cloud_supplier_product_repository: ICloudSupplierProductRepository,
  ) {}

  products(
    input: TSupplierProductsSchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TSupplierProductsOutput>, ServiceError>
  > {
    return this.cloud_supplier_product_repository.supplierProducts(input, {
      authorization: accessToken,
    });
  }
}
