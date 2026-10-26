//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type { TPaginationService } from '@domain/types/shared';
import type { TLocalProductsQuerySchema } from '../../schemas';
import type { TLocalProductOutput } from '../../types/entities';

export interface ILocalService {
  products(
    input: TLocalProductsQuerySchema,
    user: TUserDetail,
  ): Promise<
    ResultPattern<TPaginationService<TLocalProductOutput>, ServiceError>
  >;
}
