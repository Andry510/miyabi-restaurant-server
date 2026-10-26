import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { ICloudSupplierProductRepository } from '../../../domain/interfaces/repositories';
import type { ISupplierProductService } from '../../../domain/interfaces/services';
import type { TSupplierProductParamSchema } from '../../../domain/schemas';
import type { TSupplierProductOutput } from '../../../domain/types/entities';

//Infrastructure
import { SUPPLIER_PRODUCT_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Injectable()
export class SupplierProductService implements ISupplierProductService {
  constructor(
    @Inject(
      SUPPLIER_PRODUCT_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SUPPLIER_PRODUCT,
    )
    private readonly cloud_supplier_product_repository: ICloudSupplierProductRepository,
  ) {}

  supplierProduct(
    input: TSupplierProductParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TSupplierProductOutput, ServiceError>> {
    return this.cloud_supplier_product_repository.supplierProduct(input, {
      authorization: accessToken,
    });
  }
}
