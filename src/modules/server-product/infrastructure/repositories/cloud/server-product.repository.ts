import type { CallOptions, Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TDataResponse } from '@domain/types/shared';
import type { ICloudServerProductRepository } from '../../../domain/interfaces/repositories';
import type {
  TCloudServerProductsInput,
  TCloudServerProductsOutput,
} from '../../../domain/types/services';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TServerProductsResponse = TDataResponse<unknown[]> & {
  removed_ids: string[];
  synced_at: string;
};

type TServerProductGrpc = {
  server_products(
    data: TCloudServerProductsInput,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TServerProductsResponse>;
};

@Injectable()
export class CloudServerProductRepository
  implements ICloudServerProductRepository, OnModuleInit
{
  private server_product_service!: TServerProductGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.server_product_service = this.client.getService<TServerProductGrpc>(
      CLOUD_GRPC_SERVICE.SERVER_PRODUCT,
    );
  }

  serverProducts = async (
    updatedSince: Date | null,
  ): Promise<ResultPattern<TCloudServerProductsOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.server_product_service.server_products(
        updatedSince ? { updated_since: updatedSince.toISOString() } : {},
        CloudRequest.metadata(),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    const { data, removed_ids, synced_at } = response.Value;

    return ResultPattern.Success({
      data,
      removed_ids,
      synced_at: new Date(synced_at),
    });
  };
}
