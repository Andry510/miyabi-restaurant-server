import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { ICloudTransferRepository } from '../../../domain/interfaces/repositories';
import type { ITransferService } from '../../../domain/interfaces/services';
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
import { TRANSFER_PROVIDER_TOKENS } from '../../../infrastructure/constants';

@Injectable()
export class TransferService implements ITransferService {
  constructor(
    @Inject(TRANSFER_PROVIDER_TOKENS.REPOSITORIES.CLOUD_TRANSFER)
    private readonly cloud_transfer_repository: ICloudTransferRepository,
  ) {}

  register(
    input: TRegisterBodySchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> {
    return this.cloud_transfer_repository.register(input, {
      authorization: accessToken,
    });
  }

  transfers(
    input: TTransfersQuerySchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TTransfersOutput>, ServiceError>
  > {
    return this.cloud_transfer_repository.transfers(input, {
      authorization: accessToken,
    });
  }

  transfer(
    input: TTransferParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> {
    return this.cloud_transfer_repository.transfer(input, {
      authorization: accessToken,
    });
  }

  receive(
    input: TReceiveTransferSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> {
    return this.cloud_transfer_repository.receive(input, {
      authorization: accessToken,
    });
  }

  cancel(
    input: TTransferParamSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<TTransferOutput, ServiceError>> {
    return this.cloud_transfer_repository.cancel(input, {
      authorization: accessToken,
    });
  }
}
