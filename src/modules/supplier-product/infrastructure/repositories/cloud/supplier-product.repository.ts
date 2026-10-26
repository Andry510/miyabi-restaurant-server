import type { CallOptions, Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type {
  TCloudTokens,
  TDataResponse,
  TPaginationResponse,
  TPaginationService,
} from '@domain/types/shared';
import type { ICloudSupplierProductRepository } from '../../../domain/interfaces/repositories';
import type {
  TProductSuppliersSchema,
  TSupplierProductParamSchema,
  TSupplierProductsSchema,
} from '../../../domain/schemas';
import type {
  TProductSuppliersOutput,
  TSupplierProductOutput,
  TSupplierProductsOutput,
} from '../../../domain/types/entities';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TSupplierProductGrpc = {
  supplier_product(
    data: TSupplierProductParamSchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TSupplierProductOutput>>;
  supplier_products(
    data: TSupplierProductsSchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TPaginationResponse<TSupplierProductsOutput[]>>;
  product_suppliers(
    data: TProductSuppliersSchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TPaginationResponse<TProductSuppliersOutput[]>>;
};

@Injectable()
export class CloudSupplierProductRepository
  implements ICloudSupplierProductRepository, OnModuleInit
{
  private supplier_product_service!: TSupplierProductGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.supplier_product_service =
      this.client.getService<TSupplierProductGrpc>(
        CLOUD_GRPC_SERVICE.SUPPLIER_PRODUCT,
      );
  }

  supplierProduct = async (
    input: TSupplierProductParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TSupplierProductOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.supplier_product_service.supplier_product(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };

  supplierProducts = async (
    input: TSupplierProductsSchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TSupplierProductsOutput>, ServiceError>
  > => {
    const response = await CloudRequest.send(
      this.supplier_product_service.supplier_products(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    const { data, meta } = response.Value;

    return ResultPattern.Success({ data, metadata: meta });
  };

  productSuppliers = async (
    input: TProductSuppliersSchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TProductSuppliersOutput>, ServiceError>
  > => {
    const response = await CloudRequest.send(
      this.supplier_product_service.product_suppliers(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    const { data, meta } = response.Value;

    return ResultPattern.Success({ data, metadata: meta });
  };
}
