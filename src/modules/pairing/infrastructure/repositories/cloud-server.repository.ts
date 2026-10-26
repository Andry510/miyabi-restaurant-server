import type { CallOptions, Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TDataResponse } from '@domain/types/shared';
import type { ICloudServerRepository } from '../../domain/interfaces/repositories';
import type { TCloudRegisterInput } from '../../domain/types/services';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TServerGrpc = {
  register(
    data: TCloudRegisterInput,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TDataResponse<string>>;
};

@Injectable()
export class CloudServerRepository
  implements ICloudServerRepository, OnModuleInit
{
  private server_service!: TServerGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.server_service = this.client.getService<TServerGrpc>(
      CLOUD_GRPC_SERVICE.SERVER,
    );
  }

  register = async (
    data: TCloudRegisterInput,
    enrollmentToken: string,
  ): Promise<ResultPattern<string, ServiceError>> => {
    const response = await CloudRequest.send(
      this.server_service.register(
        data,
        CloudRequest.metadata({ authorization: enrollmentToken }),
        CloudRequest.options(),
      ),
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };
}
