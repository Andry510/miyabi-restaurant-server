import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { ICloudProductRepository } from '../../domain/interfaces/repositories';
import type { IProductService } from '../../domain/interfaces/services';
import type {
  TProductParamSchema,
  TProductsQuerySchema,
} from '../../domain/schemas';
import type {
  TProductOutput,
  TProductsOutput,
} from '../../domain/types/entities';

//Infrastructure
import { PRODUCT_PROVIDER_TOKENS } from '../../infrastructure/constants';

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @Inject(PRODUCT_PROVIDER_TOKENS.REPOSITORIES.CLOUD_PRODUCT)
    private readonly cloud_product_repository: ICloudProductRepository,
  ) {}

  products(
    input: TProductsQuerySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TPaginationService<TProductsOutput>, ServiceError>> {
    return this.cloud_product_repository.products(input, {
      authorization: accessToken,
    });
  }

  product(
    input: TProductParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TProductOutput, ServiceError>> {
    return this.cloud_product_repository.product(input, {
      authorization: accessToken,
    });
  }
}
