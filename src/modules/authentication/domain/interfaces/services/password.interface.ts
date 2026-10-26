//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TResetPasswordOutput } from '../../types/entities';
import type { TResetPasswordInput } from '../../types/services';

export interface IPasswordService {
  reset(
    input: TResetPasswordInput,
    passwordToken: string,
  ): Promise<ResultPattern<TResetPasswordOutput, ServiceError>>;
}
