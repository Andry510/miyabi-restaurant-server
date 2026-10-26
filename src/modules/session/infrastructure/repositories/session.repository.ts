import type { PrismaClient } from '@generated/prisma/client';
import type { sessionsWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { SessionAggregate } from '../../domain/aggregates';
import type { UserSession } from '../../domain/entities';
import type { ISessionRepository } from '../../domain/interfaces/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { SessionMapper } from '../mappers';

const SESSION_SELECT = {
  id: true,
  secret_key: true,
  refresh_token_hash: true,
  status: true,
  user_id: true,
  requester_ip: true,
  device: true,
  browser: true,
  revoked_by: true,
  revoked_at: true,
  expire_at: true,
  user: { select: { authentication: { select: { email: true } } } },
} as const;

@Injectable()
export class SessionRepository implements ISessionRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findActiveByUserAndKey = (
    userId: string,
    secretKey: string,
  ): Promise<ResultPattern<SessionAggregate | null>> =>
    this.findOne({ user_id: userId, secret_key: secretKey, status: 'active' });

  findByUserAndKey = (
    userId: string,
    secretKey: string,
  ): Promise<ResultPattern<SessionAggregate | null>> =>
    this.findOne({ user_id: userId, secret_key: secretKey });

  update = (session: UserSession): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SessionRepository.name,
      async () => {
        await this.primaryDatabase.sessions.update({
          where: { id: session.Id },
          data: SessionMapper.toPersistence(session),
        });
      },
    );

  //Functions
  private findOne = (
    where: sessionsWhereInput,
  ): Promise<ResultPattern<SessionAggregate | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SessionRepository.name,
      async () => {
        const response = await this.primaryDatabase.sessions.findFirst({
          where,
          select: SESSION_SELECT,
        });

        return response ? SessionMapper.toDomain(response) : null;
      },
    );
}
