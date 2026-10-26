import type { CallOptions, Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type {
  TClientInput,
  TCloudTokens,
  TDataResponse,
  TMessageResponse,
} from '@domain/types/shared';
import type { ICloudSessionRepository } from '../../../domain/interfaces/repositories';
import type { TRefreshTokenOutput } from '../../../domain/types/entities';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TSessionGrpc = {
  refresh_token(
    data: TClientInput,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<TRefreshTokenOutput>>;
  logout(
    data: Record<string, never>,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TMessageResponse>;
};

@Injectable()
export class CloudSessionRepository
  implements ICloudSessionRepository, OnModuleInit
{
  private session_service!: TSessionGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.session_service = this.client.getService<TSessionGrpc>(
      CLOUD_GRPC_SERVICE.SESSION,
    );
  }

  refreshToken = async (
    input: TClientInput,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TRefreshTokenOutput, ServiceError>> => {
    const response = await CloudRequest.send(
      this.session_service.refresh_token(
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

  logout = async (
    tokens: TCloudTokens,
  ): Promise<ResultPattern<null, ServiceError>> => {
    const response = await CloudRequest.send(
      this.session_service.logout(
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
