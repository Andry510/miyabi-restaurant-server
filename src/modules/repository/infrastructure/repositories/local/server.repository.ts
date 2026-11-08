import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { IServerRepository } from '../../../domain/interfaces/repositories';
import type {
  TPairInput,
  TPairingRow,
  TPairingStatus,
} from '../../../domain/types';

//Infrastructure
import { SERVER_SETTINGS_ID } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';

const PAIRING_SELECT = {
  pairing_status: true,
  server_token_enc: true,
  location_id: true,
  unlinked_reason: true,
  paired_at: true,
  unlinked_at: true,
} as const;

type TPairingSelectRow = {
  pairing_status: string;
  server_token_enc: string | null;
  location_id: string | null;
  unlinked_reason: string | null;
  paired_at: Date | null;
  unlinked_at: Date | null;
};

const toRow = ({ pairing_status, ...row }: TPairingSelectRow): TPairingRow => ({
  ...row,
  status: pairing_status as TPairingStatus,
});

@Injectable()
export class ServerRepository implements IServerRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  find = (): Promise<ResultPattern<TPairingRow>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ServerRepository.name,
      async () => {
        await this.primaryDatabase.server_settings.createMany({
          data: [{ id: SERVER_SETTINGS_ID }],
          skipDuplicates: true,
        });

        return toRow(
          await this.primaryDatabase.server_settings.findUniqueOrThrow({
            where: { id: SERVER_SETTINGS_ID },
            select: PAIRING_SELECT,
          }),
        );
      },
    );

  pair = (input: TPairInput): Promise<ResultPattern<TPairingRow>> =>
    ResultPattern.tryCatchAsync('Infrastructure', ServerRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        if (input.wipe) {
          await transaction.transfer_drafts.deleteMany();
          await transaction.products.deleteMany();
        }

        return toRow(
          await transaction.server_settings.update({
            where: { id: SERVER_SETTINGS_ID },
            data: {
              pairing_status: 'paired',
              server_token_enc: input.server_token_enc,
              location_id: input.location_id,
              unlinked_reason: null,
              paired_at: new Date(),
              unlinked_at: null,
              products_synced_at: null,
            },
            select: PAIRING_SELECT,
          }),
        );
      }),
    );

  unlink = (reason: string): Promise<ResultPattern<TPairingRow>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ServerRepository.name,
      async () =>
        toRow(
          await this.primaryDatabase.server_settings.update({
            where: { id: SERVER_SETTINGS_ID },
            data: {
              pairing_status: 'unlinked',
              server_token_enc: null,
              unlinked_reason: reason.slice(0, 100),
              unlinked_at: new Date(),
            },
            select: PAIRING_SELECT,
          }),
        ),
    );
}
