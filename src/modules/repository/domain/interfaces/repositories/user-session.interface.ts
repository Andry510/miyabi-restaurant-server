//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { UserAggregate } from '../../aggregates';

export interface IUserSessionRepository {
  findOneByEmailAndSession(
    email: string,
    sessionKey: string,
  ): Promise<ResultPattern<UserAggregate | null>>;
}
