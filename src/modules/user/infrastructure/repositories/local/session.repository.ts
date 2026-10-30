import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { ISessionRepository } from '../../../domain/interfaces/repositories';
import type { TSessionsQuerySchema } from '../../../domain/schemas';
import type { TSessionOutput } from '../../../domain/types/entities';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { SessionMapper } from '../../mappers';

@Injectable()
export class SessionRepository implements ISessionRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findManyByUser = (
    userId: string,
    input: TSessionsQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TSessionOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SessionRepository.name,
      async () => {
        const where = { user_id: userId };

        const [count, response] = await Promise.all([
          this.primaryDatabase.sessions.count({ where }),
          this.primaryDatabase.sessions.findMany({
            where,
            select: {
              id: true,
              status: true,
              requester_ip: true,
              device: true,
              browser: true,
              last_access_at: true,
              expire_at: true,
              revoked_by: true,
              revoked_at: true,
              created_at: true,
            },
            orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((session) => SessionMapper.toOutput(session)),
        };
      },
    );

  revokeActive = (
    userId: string,
    revokedBy: string,
  ): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SessionRepository.name,
      async () => {
        const { count } = await this.primaryDatabase.sessions.updateMany({
          where: { user_id: userId, status: 'active' },
          data: {
            status: 'revoked',
            revoked_by: revokedBy,
            revoked_at: new Date(),
          },
        });

        return count;
      },
    );
}
