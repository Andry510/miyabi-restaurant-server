//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TUserDetail } from '@domain/types/entities';
import type {
  TChangePasswordBodySchema,
  TUpdateProfileBodySchema,
} from '../../../schemas';
import type { TLocalUserOutput } from '../../../types/entities';

export interface ILocalUserService {
  user(user: TUserDetail): ResultPattern<TLocalUserOutput, ServiceError>;

  updateProfile(
    user: TUserDetail,
    input: TUpdateProfileBodySchema,
  ): Promise<ResultPattern<TLocalUserOutput, ServiceError>>;

  changePassword(
    userId: string,
    input: TChangePasswordBodySchema,
  ): Promise<ResultPattern<null, ServiceError>>;
}
