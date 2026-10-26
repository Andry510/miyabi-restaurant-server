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
import type { ICloudProductRepository } from '../../domain/interfaces/repositories';
import type {
  TProductParamSchema,
  TProductsQuerySchema,
} from '../../domain/schemas';
import type {
  TProductOutput,
  TProductsOutput,
} from '../../domain/types/entities';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TProductGrpc = {
  products(
    data: TProductsQuerySchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TPaginationResponse<TProductsOutput[]>>;
  product(
    data: TProductParamSchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TProductOutput>>;
};

@Injectable()
export class CloudProductRepository
  implements ICloudProductRepository, OnModuleInit
{
  private product_service!: TProductGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.product_service = this.client.getService<TProductGrpc>(
      CLOUD_GRPC_SERVICE.PRODUCT,
    );
  }

  products = async (
    input: TProductsQuerySchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TProductsOutput>, ServiceError>
  > => {
    const response = await CloudRequest.send(
      this.product_service.products(
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

  product = async (
    input: TProductParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TProductOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.product_service.product(
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
}
