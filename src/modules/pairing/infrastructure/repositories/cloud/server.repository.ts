import type { CallOptions, Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ServiceError } from '@domain/errors';
import { ResultPattern } from '@domain/patterns/results';
import type { TDataResponse } from '@domain/types/shared';
import type { ICloudServerRepository } from '../../../domain/interfaces/repositories';
import type { TCloudRegisterInput } from '../../../domain/types/services';

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

type TServerProductGrpc = {
  server_products(
    data: { updated_since: string },
    metadata: Metadata,
    options: CallOptions,
  ): Observable<unknown>;
};

@Injectable()
export class CloudServerRepository
  implements ICloudServerRepository, OnModuleInit
{
  private server_service!: TServerGrpc;
  private server_product_service!: TServerProductGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.server_service = this.client.getService<TServerGrpc>(
      CLOUD_GRPC_SERVICE.SERVER,
    );
    this.server_product_service = this.client.getService<TServerProductGrpc>(
      CLOUD_GRPC_SERVICE.SERVER_PRODUCT,
    );
  }

  register = async (
    data: TCloudRegisterInput,
    enrollmentToken: string,
  ): Promise<ResultPattern<string, ServiceError>> => {
    const response = await CloudRequest.send(
      this.server_service.register(
        data,
        CloudRequest.metadata({ authorization: enrollmentToken }, null),
        CloudRequest.options(),
      ),
      false,
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(response.Value.data);
  };

  verify = async (
    serverToken: string,
  ): Promise<ResultPattern<null, ServiceError>> => {
    const response = await CloudRequest.send(
      this.server_product_service.server_products(
        { updated_since: new Date().toISOString() },
        CloudRequest.metadata({}, serverToken),
        CloudRequest.options(),
      ),
      false,
    );

    if (response.IsFailure) {
      return ResultPattern.Failure(response.Error);
    }

    return ResultPattern.Success(null);
  };
}
