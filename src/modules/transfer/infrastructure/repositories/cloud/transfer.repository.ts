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
import type { ICloudTransferRepository } from '../../../domain/interfaces/repositories';
import type {
  TReceiveTransferSchema,
  TRegisterBodySchema,
  TTransferParamSchema,
  TTransfersQuerySchema,
} from '../../../domain/schemas';
import type {
  TTransferOutput,
  TTransfersOutput,
} from '../../../domain/types/entities';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TTransferResponse = Observable<TDataResponse<TTransferOutput>>;

type TTransferGrpc = {
  register(
    data: TRegisterBodySchema,
    metadata: Metadata,
    options: CallOptions,
  ): TTransferResponse;
  transfers(
    data: TTransfersQuerySchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TPaginationResponse<TTransfersOutput[]>>;
  transfer(
    data: TTransferParamSchema,
    metadata: Metadata,
    options: CallOptions,
  ): TTransferResponse;
  receive_transfer(
    data: TReceiveTransferSchema,
    metadata: Metadata,
    options: CallOptions,
  ): TTransferResponse;
  cancel_transfer(
    data: TTransferParamSchema,
    metadata: Metadata,
    options: CallOptions,
  ): TTransferResponse;
};

@Injectable()
export class CloudTransferRepository
  implements ICloudTransferRepository, OnModuleInit
{
  private transfer_service!: TTransferGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.transfer_service = this.client.getService<TTransferGrpc>(
      CLOUD_GRPC_SERVICE.TRANSFER,
    );
  }

  register = async (
    input: TRegisterBodySchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> =>
    this.toTransfer(
      this.transfer_service.register(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

  transfers = async (
    input: TTransfersQuerySchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TTransfersOutput>, ServiceError>
  > => {
    const response = await CloudRequest.send(
      this.transfer_service.transfers(
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

  transfer = async (
    input: TTransferParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> =>
    this.toTransfer(
      this.transfer_service.transfer(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

  receive = async (
    input: TReceiveTransferSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> =>
    this.toTransfer(
      this.transfer_service.receive_transfer(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

  cancel = async (
    input: TTransferParamSchema,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> =>
    this.toTransfer(
      this.transfer_service.cancel_transfer(
        input,
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

  //Functions
  private async toTransfer(
    call: TTransferResponse,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> {
    const response = await CloudRequest.send(call);

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  }
}
