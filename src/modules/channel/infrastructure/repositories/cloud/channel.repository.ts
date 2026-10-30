import type { Metadata } from '@grpc/grpc-js';
import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';

//Domain
import type { ICloudChannelRepository } from '../../../domain/interfaces/repositories';
import type {
  TCloudMessage,
  TServerMessage,
} from '../../../domain/types/services';

//Infrastructure
import {
  CLOUD_GRPC_CLIENT,
  CLOUD_GRPC_SERVICE,
  CloudRequest,
} from '@infrastructure/grpc/cloud';

type TServerChannelGrpc = {
  channel(
    upstream: Observable<TServerMessage>,
    metadata: Metadata,
  ): Observable<TCloudMessage>;
};

@Injectable()
export class CloudChannelRepository
  implements ICloudChannelRepository, OnModuleInit
{
  private server_service!: TServerChannelGrpc;

  constructor(
    @Inject(CLOUD_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.server_service = this.client.getService<TServerChannelGrpc>(
      CLOUD_GRPC_SERVICE.SERVER,
    );
  }

  open(upstream: Observable<TServerMessage>): Observable<TCloudMessage> {
    return this.server_service.channel(upstream, CloudRequest.metadata());
  }
}
