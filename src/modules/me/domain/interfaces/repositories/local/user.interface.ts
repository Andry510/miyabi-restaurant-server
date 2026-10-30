//Domain
import type { ResultPattern } from '@domain/patterns/results';

export interface ILocalUserRepository {
  findPasswordHash(userId: string): Promise<ResultPattern<string | null>>;

  updatePassword(
    userId: string,
    passwordHash: string,
    revokedBy: string,
  ): Promise<ResultPattern<void>>;

  updatePhoneNumber(
    userId: string,
    phoneNumber: string,
  ): Promise<ResultPattern<boolean>>;
}
