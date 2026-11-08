import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { IManagerSessionRepository } from '../../../domain/interfaces/repositories';
import type {
  TCreateManagerSessionInput,
  TManagerSessionRow,
  TManagerSessionTokens,
} from '../../../domain/types/entities';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';

const MANAGER_SESSION_SELECT = {
  id: true,
  email: true,
  cloud_session_key: true,
  access_token_enc: true,
  refresh_token_enc: true,
  access_expires_at: true,
  last_access_at: true,
  requester_ip: true,
  device: true,
  browser: true,
} as const;

@Injectable()
export class ManagerSessionRepository implements IManagerSessionRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  create = (
    input: TCreateManagerSessionInput,
  ): Promise<ResultPattern<string>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ManagerSessionRepository.name,
      async () =>
        (
          await this.primaryDatabase.manager_sessions.create({
            data: input,
            select: { id: true },
          })
        ).id,
    );

  findByHash = (
    tokenHash: string,
  ): Promise<ResultPattern<TManagerSessionRow | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ManagerSessionRepository.name,
      () =>
        this.primaryDatabase.manager_sessions.findUnique({
          where: { token_hash: tokenHash },
          select: MANAGER_SESSION_SELECT,
        }),
    );

  updateTokens = (
    id: string,
    tokens: TManagerSessionTokens,
  ): Promise<ResultPattern<null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ManagerSessionRepository.name,
      async () => {
        await this.primaryDatabase.manager_sessions.updateMany({
          where: { id },
          data: tokens,
        });

        return null;
      },
    );

  findLastAccess = (id: string): Promise<ResultPattern<Date | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ManagerSessionRepository.name,
      async () =>
        (
          await this.primaryDatabase.manager_sessions.findUnique({
            where: { id },
            select: { last_access_at: true },
          })
        )?.last_access_at ?? null,
    );

  touch = (id: string): Promise<ResultPattern<null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ManagerSessionRepository.name,
      async () => {
        await this.primaryDatabase.manager_sessions.updateMany({
          where: { id },
          data: { last_access_at: new Date() },
        });

        return null;
      },
    );

  deleteById = (id: string): Promise<ResultPattern<null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ManagerSessionRepository.name,
      async () => {
        await this.primaryDatabase.manager_sessions.deleteMany({
          where: { id },
        });

        return null;
      },
    );

  deleteByCloudSessionKey = (
    sessionKey: string,
  ): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ManagerSessionRepository.name,
      async () =>
        (
          await this.primaryDatabase.manager_sessions.deleteMany({
            where: { cloud_session_key: sessionKey },
          })
        ).count,
    );

  deleteIdle = (before: Date): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ManagerSessionRepository.name,
      async () =>
        (
          await this.primaryDatabase.manager_sessions.deleteMany({
            where: { last_access_at: { lt: before } },
          })
        ).count,
    );
}
