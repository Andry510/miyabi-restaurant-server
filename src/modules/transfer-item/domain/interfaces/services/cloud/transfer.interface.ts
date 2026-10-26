//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TTransferItemsSchema } from '../../../schemas';
import type { TTransferItemsOutput } from '../../../types/entities';

export interface ITransferService {
  items(
    input: TTransferItemsSchema,
    accessToken: string | null,
  ): Promise<
    ResultPattern<TPaginationService<TTransferItemsOutput>, ServiceError>
  >;
}
