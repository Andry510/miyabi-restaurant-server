import type { Prisma, PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { Product } from '../../../domain/entities';
import type { IProductRepository } from '../../../domain/interfaces/repositories';
import type { TApplySyncInput } from '../../../domain/types/services';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { SERVER_SETTINGS_ID } from '@infrastructure/constants';
import { ProductMapper } from '../../mappers';

const SYNC_TIMEOUT_MS = 60_000;

@Injectable()
export class ProductRepository implements IProductRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findSyncedAt = (): Promise<ResultPattern<Date | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ProductRepository.name,
      async () => {
        const response = await this.primaryDatabase.server_settings.findUnique({
          where: { id: SERVER_SETTINGS_ID },
          select: { products_synced_at: true },
        });

        return response?.products_synced_at ?? null;
      },
    );

  applySync = (input: TApplySyncInput): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ProductRepository.name,
      async () => {
        await this.primaryDatabase.$transaction(
          async (transaction) => {
            for (const product of input.products) {
              await this.save(transaction, product);
            }

            await this.remove(transaction, input.removed_ids);

            await transaction.server_settings.createMany({
              data: [{ id: SERVER_SETTINGS_ID }],
              skipDuplicates: true,
            });

            await transaction.server_settings.update({
              where: { id: SERVER_SETTINGS_ID },
              data: { products_synced_at: input.synced_at },
            });
          },
          { timeout: SYNC_TIMEOUT_MS },
        );
      },
    );

  upsert = (product: Product): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ProductRepository.name,
      async () => {
        await this.save(this.primaryDatabase, product);
      },
    );

  removeByCloudId = (cloudId: string): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ProductRepository.name,
      async () => {
        await this.remove(this.primaryDatabase, [cloudId]);
      },
    );

  //Functions
  private async save(
    client: Prisma.TransactionClient,
    product: Product,
  ): Promise<void> {
    const data = ProductMapper.toPersistence(product);

    const updated = await client.products.updateMany({
      where: {
        cloud_id: product.CloudId,
        cloud_updated_at: { lte: product.CloudUpdatedAt },
      },
      data,
    });

    if (updated.count > 0) {
      return;
    }

    const stored = await client.products.findUnique({
      where: { cloud_id: product.CloudId },
      select: { id: true },
    });

    if (!stored) {
      await client.products.create({ data });
    }
  }

  private async remove(
    client: Prisma.TransactionClient,
    cloudIds: string[],
  ): Promise<void> {
    if (cloudIds.length === 0) {
      return;
    }

    await client.products.updateMany({
      where: { cloud_id: { in: cloudIds }, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  }
}
