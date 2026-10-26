//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TLoginOutput } from '../../types/entities';
import type { TLoginInput } from '../../types/services';

export interface IAuthenticationService {
  login(input: TLoginInput): Promise<ResultPattern<TLoginOutput, ServiceError>>;
}
