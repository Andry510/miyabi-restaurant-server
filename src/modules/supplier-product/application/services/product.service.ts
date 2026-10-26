import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { ICloudSupplierProductRepository } from '../../domain/interfaces/repositories';
import type { IProductService } from '../../domain/interfaces/services';
import type { TProductSuppliersSchema } from '../../domain/schemas';
import type { TProductSuppliersOutput } from '../../domain/types/entities';

//Infrastructure
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../../infrastructure/constants';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @Inject(
      SUPPLIER_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SUPPLIER_PRODUCT,
    )
    private readonly cloud_supplier_product_repository: ICloudSupplierProductRepository,
  ) {}

  suppliers(
    input: TProductSuppliersSchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TProductSuppliersOutput>, ServiceError>
  > {
    return this.cloud_supplier_product_repository.productSuppliers(input, {
      authorization: accessToken,
    });
  }
}
