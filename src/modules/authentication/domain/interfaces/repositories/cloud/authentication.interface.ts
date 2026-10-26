//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TCloudTokens } from '@domain/types/shared';
import type {
  TLoginOutput,
  TMfaCodeOutput,
  TResetPasswordOutput,
} from '../../../types/entities';
import type {
  TLoginInput,
  TMfaCodeInput,
  TResetPasswordInput,
} from '../../../types/services';

export interface ICloudAuthenticationRepository {
  login(input: TLoginInput): Promise<ResultPattern<TLoginOutput, ServiceError>>;

  mfaQr(tokens: TCloudTokens): Promise<ResultPattern<string, ServiceError>>;

  mfaCode(
    input: TMfaCodeInput,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TMfaCodeOutput, ServiceError>>;

  resetPassword(
    input: TResetPasswordInput,
    tokens: TCloudTokens,
  ): Promise<ResultPattern<TResetPasswordOutput, ServiceError>>;
}
