//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TLinksQuerySchema } from '../../../schemas';
import type { TLinkedOutput, TLinkedUserOutput } from '../../../types/entities';

export interface IJobPositionService {
  workAreas(
    id: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TLinkedOutput>, ServiceError>>;

  assign(id: string, ids: string[]): Promise<ResultPattern<null, ServiceError>>;

  remove(id: string, ids: string[]): Promise<ResultPattern<null, ServiceError>>;

  users(
    id: string,
    input: TLinksQuerySchema,
  ): Promise<
    ResultPattern<TPaginationService<TLinkedUserOutput>, ServiceError>
  >;
}
