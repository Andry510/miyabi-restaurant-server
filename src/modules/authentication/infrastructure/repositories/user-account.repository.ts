import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { UserAccount } from '../../domain/entities';
import type { IUserAccountRepository } from '../../domain/interfaces/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { UserAccountMapper } from '../mappers';

@Injectable()
export class UserAccountRepository implements IUserAccountRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findByEmail = (email: string): Promise<ResultPattern<UserAccount | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserAccountRepository.name,
      async () => {
        const response = await this.primaryDatabase.authentications.findUnique({
          where: { email },
          select: {
            email: true,
            password: true,
            password_need_reset: true,
            user: { select: { id: true, status: true, deleted_at: true } },
          },
        });

        return response ? UserAccountMapper.toDomain(response) : null;
      },
    );

  updatePasswordByEmail = (
    email: string,
    hashedPassword: string,
  ): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserAccountRepository.name,
      async () => {
        await this.primaryDatabase.authentications.update({
          where: { email },
          data: { password: hashedPassword, password_need_reset: false },
        });
      },
    );
}
