//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TSessionsQuerySchema } from '../../../schemas';
import type { TSessionOutput } from '../../../types/entities';

export interface ISessionRepository {
  findManyByUser(
    userId: string,
    input: TSessionsQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TSessionOutput>>>;

  revokeActive(
    userId: string,
    revokedBy: string,
  ): Promise<ResultPattern<number>>;
}
