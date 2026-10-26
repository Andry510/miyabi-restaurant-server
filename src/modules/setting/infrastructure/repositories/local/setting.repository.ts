import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { ISettingRepository } from '../../../domain/interfaces/repositories';
import type { TUpdateSettingsSchema } from '../../../domain/schemas';
import type { TSettingsOutput } from '../../../domain/types/entities';

//Infrastructure
import { SERVER_SETTINGS_ID } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { SettingMapper } from '../../mappers';

const SETTINGS_SELECT = {
  timezone: true,
  clock_in_window_minutes: true,
  tip_period: true,
  products_synced_at: true,
  updated_at: true,
};

@Injectable()
export class SettingRepository implements ISettingRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  find = (): Promise<ResultPattern<TSettingsOutput>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SettingRepository.name,
      async () => {
        const response =
          (await this.primaryDatabase.server_settings.findUnique({
            where: { id: SERVER_SETTINGS_ID },
            select: SETTINGS_SELECT,
          })) ??
          (await this.primaryDatabase.server_settings.upsert({
            where: { id: SERVER_SETTINGS_ID },
            create: { id: SERVER_SETTINGS_ID },
            update: {},
            select: SETTINGS_SELECT,
          }));

        return SettingMapper.toOutput(response);
      },
    );

  hasOpenTipPools = (): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SettingRepository.name,
      async () =>
        (await this.primaryDatabase.tip_pools.count({
          where: { status: 'open' },
          take: 1,
        })) > 0,
    );

  update = (
    input: TUpdateSettingsSchema,
  ): Promise<ResultPattern<TSettingsOutput>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      SettingRepository.name,
      async () => {
        const response = await this.primaryDatabase.server_settings.upsert({
          where: { id: SERVER_SETTINGS_ID },
          create: { id: SERVER_SETTINGS_ID, ...input },
          update: input,
          select: SETTINGS_SELECT,
        });

        return SettingMapper.toOutput(response);
      },
    );
}
