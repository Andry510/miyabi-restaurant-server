//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TLinksQuerySchema } from '../../../schemas';
import type { TAreaProductOutput } from '../../../types/entities';

export interface IWorkAreaService {
  products(
    id: string,
    input: TLinksQuerySchema,
  ): Promise<
    ResultPattern<TPaginationService<TAreaProductOutput>, ServiceError>
  >;

  assign(id: string, ids: string[]): Promise<ResultPattern<null, ServiceError>>;

  remove(id: string, ids: string[]): Promise<ResultPattern<null, ServiceError>>;
}
