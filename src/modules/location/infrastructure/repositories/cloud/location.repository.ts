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
import type { ICloudLocationRepository } from '../../../domain/interfaces/repositories';
import type { TLocationsQuerySchema } from '../../../domain/schemas';
import type { TLocationsOutput } from '../../../domain/types/entities';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TLocationGrpc = {
  locations(
    data: TLocationsQuerySchema,
    metadata: Metadata,
    options: CallOptions,
  ): Observable<TPaginationResponse<TLocationsOutput[]>>;
};

@Injectable()
export class CloudLocationRepository
  implements ICloudLocationRepository, OnModuleInit
{
  private location_service!: TLocationGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.location_service = this.client.getService<TLocationGrpc>(
      CLOUD_GRPC_SERVICE.LOCATION,
    );
  }

  locations = async (
    input: TLocationsQuerySchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TLocationsOutput>, ServiceError>
  > => {
    const response = await CloudRequest.send(
      this.location_service.locations(
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
