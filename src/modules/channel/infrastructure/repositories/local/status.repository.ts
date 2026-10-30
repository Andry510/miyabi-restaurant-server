import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { IStatusRepository } from '../../../domain/interfaces/repositories';
import type { TStatusSnapshot } from '../../../domain/types/services';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { SERVER_SETTINGS_ID } from '@infrastructure/constants';

@Injectable()
export class StatusRepository implements IStatusRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  snapshot = (): Promise<ResultPattern<TStatusSnapshot>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      StatusRepository.name,
      async () => {
        const [settings, pending, failed] = await Promise.all([
          this.primaryDatabase.server_settings.findUnique({
            where: { id: SERVER_SETTINGS_ID },
            select: { products_synced_at: true },
          }),
          this.primaryDatabase.transfer_draft_dispatches.count({
            where: { status: 'pending' },
          }),
          this.primaryDatabase.transfer_draft_dispatches.count({
            where: { status: 'failed' },
          }),
        ]);

        return {
          products_synced_at: settings?.products_synced_at ?? null,
          pending_dispatches: pending,
          failed_dispatches: failed,
        };
      },
    );
}
