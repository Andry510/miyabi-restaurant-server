//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TLoginOutput, TResetPasswordOutput } from '../../types/entities';
import type { TLoginInput, TResetPasswordInput } from '../../types/services';

export interface ILocalService {
  login(input: TLoginInput): Promise<ResultPattern<TLoginOutput, ServiceError>>;

  resetPassword(
    input: TResetPasswordInput,
    passwordToken: string,
  ): Promise<ResultPattern<TResetPasswordOutput, ServiceError>>;
}
