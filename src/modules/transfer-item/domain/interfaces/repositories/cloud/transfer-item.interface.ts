//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens, TPaginationService } from '@domain/types/shared';
import type { TTransferItemsSchema } from '../../../schemas';
import type { TTransferItemsOutput } from '../../../types/entities';

export interface ICloudTransferItemRepository {
  transferItems(
    input: TTransferItemsSchema,
    tokens: TCloudTokens,
  ): Promise<
    ResultPattern<TPaginationService<TTransferItemsOutput>, ServiceError>
  >;
}
