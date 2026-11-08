//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';

export interface ISessionService {
  logout(sessionToken: string): Promise<ResultPattern<null, ServiceError>>;
}
