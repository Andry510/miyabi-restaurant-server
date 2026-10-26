import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { ICloudSupplierRepository } from '../../../domain/interfaces/repositories';
import type { ISupplierService } from '../../../domain/interfaces/services';
import type {
  TSupplierParamSchema,
  TSuppliersQuerySchema,
} from '../../../domain/schemas';
import type {
  TSupplierOutput,
  TSuppliersOutput,
} from '../../../domain/types/entities';

//Infrastructure
import { SUPPLIER_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Injectable()
export class SupplierService implements ISupplierService {
  constructor(
    @Inject(SUPPLIER_PROVIDER_TOKENS.REPOSITORIES.CLOUD_SUPPLIER)
    private readonly cloud_supplier_repository: ICloudSupplierRepository,
  ) {}

  suppliers(
    input: TSuppliersQuerySchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TSuppliersOutput>, ServiceError>
  > {
    return this.cloud_supplier_repository.suppliers(input, {
      authorization: accessToken,
    });
  }

  supplier(
    input: TSupplierParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TSupplierOutput, ServiceError>> {
    return this.cloud_supplier_repository.supplier(input, {
      authorization: accessToken,
    });
  }
}
