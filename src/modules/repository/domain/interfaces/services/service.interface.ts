//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TValidateAccessOutput } from '../../types';

export interface IRepositoryService {
  serverToken(): ResultPattern<string, ServiceError>;

  validateAccess(
    accessToken: string,
  ): Promise<ResultPattern<TValidateAccessOutput, ServiceError>>;

  validateManagerAccess(
    accessToken: string,
  ): Promise<ResultPattern<null, ServiceError>>;
}
