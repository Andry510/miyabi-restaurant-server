import type { CallOptions, Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens, TMessageResponse } from '@domain/types/shared';
import type { ICloudSessionRepository } from '../../domain/interfaces/repositories';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TSessionGrpc = {
  validate(
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

  validate = async (
    tokens: TCloudTokens,
  ): Promise<ResultPattern<null, ServiceError>> => {
    const response = await CloudRequest.send(
      this.session_service.validate(
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
