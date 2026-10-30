//Domain
import type { ServiceError } from '@domain/errors';
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationService } from '@domain/types/shared';
import type {
  TRegisterSchema,
  TUpdateBodySchema,
  TUsersQuerySchema,
} from '../../../schemas';
import type { TUserOutput, TUsersOutput } from '../../../types/entities';

export interface IUserService {
  users(
    input: TUsersQuerySchema,
  ): Promise<ResultPattern<TPaginationService<TUsersOutput>, ServiceError>>;

  user(id: string): Promise<ResultPattern<TUserOutput, ServiceError>>;

  register(
    input: TRegisterSchema,
    accessToken: string | null,
  ): Promise<ResultPattern<ArrayBuffer, ServiceError>>;

  update(
    id: string,
    input: TUpdateBodySchema,
  ): Promise<ResultPattern<TUserOutput, ServiceError>>;

  resetPassword(
    id: string,
    accessToken: string | null,
  ): Promise<ResultPattern<ArrayBuffer, ServiceError>>;

  remove(id: string): Promise<ResultPattern<null, ServiceError>>;
}
