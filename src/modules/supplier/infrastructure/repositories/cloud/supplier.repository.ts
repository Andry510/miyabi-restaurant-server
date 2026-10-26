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
import type { ICloudSupplierRepository } from '../../../domain/interfaces/repositories';
import type {
  TSupplierParamSchema,
  TSuppliersQuerySchema,
} from '../../../domain/schemas';
import type {
  TSupplierOutput,
  TSuppliersOutput,
} from '../../../domain/types/entities';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TSupplierGrpc = {
  suppliers(
    data: TSuppliersQuerySchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TPaginationResponse<TSuppliersOutput[]>>;
  supplier(
    data: TSupplierParamSchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TSupplierOutput>>;
};

@Injectable()
export class CloudSupplierRepository
  implements ICloudSupplierRepository, OnModuleInit
{
  private supplier_service!: TSupplierGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.supplier_service = this.client.getService<TSupplierGrpc>(
      CLOUD_GRPC_SERVICE.SUPPLIER,
    );
  }

  suppliers = async (
    input: TSuppliersQuerySchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TSuppliersOutput>, ServiceError>
  > => {
    const response = await CloudRequest.send(
      this.supplier_service.suppliers(
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

  supplier = async (
    input: TSupplierParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TSupplierOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.supplier_service.supplier(
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
