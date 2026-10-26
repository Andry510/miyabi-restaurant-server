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
  TMessageResponse,
} from '@domain/types/shared';
import type { ICloudMeRepository } from '../../../domain/interfaces/repositories';
import type {
  TLocationOutput,
  TUserOutput,
} from '../../../domain/types/entities';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TEmpty = Record<string, never>;

type TMeGrpc = {
  user(
    data: TEmpty,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TUserOutput>>;
  location(
    data: TEmpty,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TLocationOutput>>;
  upload_picture(
    data: { picture: Uint8Array },
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<string>>;
  remove_picture(
    data: TEmpty,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TMessageResponse>;
};

@Injectable()
export class CloudMeRepository implements ICloudMeRepository, OnModuleInit {
  private me_service!: TMeGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.me_service = this.client.getService<TMeGrpc>(CLOUD_GRPC_SERVICE.ME);
  }

  user = async (
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TUserOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.me_service.user(
        {},
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };

  location = async (
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TLocationOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.me_service.location(
        {},
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };

  uploadPicture = async (
    picture: Uint8Array,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<string, ServiceError>> => {
    const response = await CloudRequest.send(
      this.me_service.upload_picture(
        { picture },
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };

  removePicture = async (
    tokens: TCloudTokens,
  ): Promise<ResultPattern<null, ServiceError>> => {
    const response = await CloudRequest.send(
      this.me_service.remove_picture(
        {},
        CloudRequest.metadata(tokens),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(null);
  };
}
