//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { UserSession } from '../../../entities';

export interface ISessionRepository {
  replaceActive(
    session: UserSession,
    revokedBy: string,
  ): Promise<ResultPattern<void>>;
}
