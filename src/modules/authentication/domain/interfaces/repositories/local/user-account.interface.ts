//Domain
import type { ResultPattern } from '@domain/patterns/results';
import type { UserAccount } from '../../../entities';

export interface IUserAccountRepository {
  findByEmail(email: string): Promise<ResultPattern<UserAccount | null>>;

  updatePasswordByEmail(
    email: string,
    hashedPassword: string,
  ): Promise<ResultPattern<void>>;
}
