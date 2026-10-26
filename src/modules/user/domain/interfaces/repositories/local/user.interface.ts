//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { TUsersQuerySchema } from '../../../schemas';
import type { TUserOutput, TUsersOutput } from '../../../types/entities';
import type {
  TCreateUserInput,
  TUpdateUserInput,
  TUserConflicts,
} from '../../../types/repositories';

export interface IUserRepository {
  findMany(
    input: TUsersQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TUsersOutput>>>;

  findById(id: string): Promise<ResultPattern<TUserOutput | null>>;

  doesExistById(id: string): Promise<ResultPattern<boolean>>;

  findConflicts(
    email: string | null,
    phoneNumber: string | null,
    exceptUserId: string | null,
  ): Promise<ResultPattern<TUserConflicts>>;

  findAreaJobPositionId(
    workAreaId: string,
    jobPositionId: string,
  ): Promise<ResultPattern<string | null>>;

  create(input: TCreateUserInput): Promise<ResultPattern<TUserOutput>>;

  update(input: TUpdateUserInput): Promise<ResultPattern<TUserOutput | null>>;

  softDelete(id: string, revokedBy: string): Promise<ResultPattern<boolean>>;
}
