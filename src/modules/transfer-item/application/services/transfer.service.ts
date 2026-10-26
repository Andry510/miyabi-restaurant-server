import { Inject, Injectable } from '@nestjs/common';

//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { ICloudTransferItemRepository } from '../../domain/interfaces/repositories';
import type { ITransferService } from '../../domain/interfaces/services';
import type { TTransferItemsSchema } from '../../domain/schemas';
import type { TTransferItemsOutput } from '../../domain/types/entities';

//Infrastructure
import { TRANSFER_ITEM_PROVIDER_TOKENS } from '../../infrastructure/constants';

@Injectable()
export class TransferService implements ITransferService {
  constructor(
    @Inject(TRANSFER_ITEM_PROVIDER_TOKENS.REPOSITORIES.CLOUD_TRANSFER_ITEM)
    private readonly cloud_transfer_item_repository: ICloudTransferItemRepository,
  ) {}

  items(
    input: TTransferItemsSchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TTransferItemsOutput>, ServiceError>
  > {
    return this.cloud_transfer_item_repository.transferItems(input, {
      authorization: accessToken,
    });
  }
}
