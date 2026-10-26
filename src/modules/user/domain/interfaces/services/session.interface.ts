//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type { TSessionsQuerySchema } from '../../schemas';
import type { TSessionOutput } from '../../types/entities';

export interface ISessionService {
  sessions(
    userId: string,
    input: TSessionsQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TSessionOutput>, ServiceError>>;
}
