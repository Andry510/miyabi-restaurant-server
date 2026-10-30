import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { ILocalUserRepository } from '../../../domain/interfaces/repositories';

//Infrastructure
import { PRISMA_ERROR_CODE } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager, PrismaError } from '@infrastructure/database';

@Injectable()
export class LocalUserRepository implements ILocalUserRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findPasswordHash = (userId: string): Promise<ResultPattern<string | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      LocalUserRepository.name,
      async () => {
        const response = await this.primaryDatabase.authentications.findUnique({
          where: { user_id: userId },
          select: { password: true },
        });

        return response?.password ?? null;
      },
    );

  updatePassword = (
    userId: string,
    passwordHash: string,
    revokedBy: string,
  ): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      LocalUserRepository.name,
      async () => {
        await this.primaryDatabase.users.update({
          where: { id: userId },
          data: {
            authentication: {
              update: { password: passwordHash, password_need_reset: false },
            },
            sessions: {
              updateMany: {
                where: { status: 'active' },
                data: {
                  status: 'revoked',
                  revoked_by: revokedBy,
                  revoked_at: new Date(),
                },
              },
            },
          },
          select: { id: true },
        });
      },
    );

  updatePhoneNumber = (
    userId: string,
    phoneNumber: string,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      LocalUserRepository.name,
      async () => {
        try {
          await this.primaryDatabase.authentications.update({
            where: { user_id: userId },
            data: { phone_number: phoneNumber },
            select: { user_id: true },
          });

          return true;
        } catch (error) {
          if (PrismaError.is(error, PRISMA_ERROR_CODE.UNIQUE)) {
            return false;
          }

          throw error;
        }
      },
    );
}
