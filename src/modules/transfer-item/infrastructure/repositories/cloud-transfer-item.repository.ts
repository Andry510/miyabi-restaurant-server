import type { CallOptions, Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type {
  TCloudTokens,
  TPaginationResponse,
  TPaginationService,
} from '@domain/types/shared';
import type { ICloudTransferItemRepository } from '../../domain/interfaces/repositories';
import type { TTransferItemsSchema } from '../../domain/schemas';
import type { TTransferItemsOutput } from '../../domain/types/entities';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TTransferItemGrpc = {
  transfer_items(
    data: TTransferItemsSchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TPaginationResponse<TTransferItemsOutput[]>>;
};

@Injectable()
export class CloudTransferItemRepository
  implements ICloudTransferItemRepository, OnModuleInit
{
  private transfer_item_service!: TTransferItemGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.transfer_item_service = this.client.getService<TTransferItemGrpc>(
      CLOUD_GRPC_SERVICE.TRANSFER_ITEM,
    );
  }

  transferItems = async (
    input: TTransferItemsSchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TTransferItemsOutput>, ServiceError>
  > => {
    const response = await CloudRequest.send(
      this.transfer_item_service.transfer_items(
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
