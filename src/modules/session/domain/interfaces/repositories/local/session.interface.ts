//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { SessionAggregate } from '../../../aggregates';
import type { UserSession } from '../../../entities';

export interface ISessionRepository {
  findActiveByUserAndKey(
    userId: string,
    secretKey: string,
  ): Promise<ResultPattern<SessionAggregate | null>>;

  findByUserAndKey(
    userId: string,
    secretKey: string,
  ): Promise<ResultPattern<SessionAggregate | null>>;

  update(session: UserSession): Promise<ResultPattern<void>>;
}
