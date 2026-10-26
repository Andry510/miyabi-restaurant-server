import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { UserAggregate } from '../../domain/aggregates';
import type { IUserSessionRepository } from '../../domain/interfaces/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { UserMapper } from '../mappers';

@Injectable()
export class UserSessionRepository implements IUserSessionRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findOneByEmailAndSession = (
    email: string,
    sessionKey: string,
  ): Promise<ResultPattern<UserAggregate | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      UserSessionRepository.name,
      async () => {
        const response = await this.primaryDatabase.authentications.findUnique({
          where: {
            email,
            user: {
              deleted_at: null,
              sessions: { some: { status: 'active', secret_key: sessionKey } },
            },
          },
          select: {
            email: true,
            phone_number: true,
            user: {
              select: {
                id: true,
                status: true,
                profile: { select: { first_name: true, last_name: true } },
                assignments: {
                  where: { status: true, deleted_at: null },
                  select: {
                    id: true,
                    area_job_position: {
                      select: { work_area_id: true, job_position_id: true },
                    },
                  },
                  take: 1,
                },
              },
            },
          },
        });

        return response ? UserMapper.toDomain(response) : null;
      },
    );
}
