import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { UserSession } from '../../domain/entities';
import type { ISessionRepository } from '../../domain/interfaces/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { SessionMapper } from '../mappers';

@Injectable()
export class SessionRepository implements ISessionRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  replaceActive = (
    session: UserSession,
    revokedBy: string,
  ): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SessionRepository.name,
      async () => {
        const data = SessionMapper.toPersistence(session);

        await this.primaryDatabase.$transaction(async (transaction) => {
          await transaction.users.update({
            where: { id: data.user_id },
            data: { updated_at: new Date() },
          });

          await transaction.sessions.updateMany({
            where: { user_id: data.user_id, status: 'active' },
            data: {
              status: 'revoked',
              revoked_by: revokedBy,
              revoked_at: new Date(),
            },
          });

          await transaction.sessions.create({ data });
        });
      },
    );
}
