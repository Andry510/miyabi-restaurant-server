import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { ICatalogRepository } from '../../../domain/interfaces/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';

@Injectable()
export class CatalogRepository implements ICatalogRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  countWorkAreas = (ids: string[]): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync('Infrastructure', CatalogRepository.name, () =>
      this.primaryDatabase.work_areas.count({
        where: { id: { in: ids }, deleted_at: null },
      }),
    );

  countJobPositions = (ids: string[]): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync('Infrastructure', CatalogRepository.name, () =>
      this.primaryDatabase.job_positions.count({
        where: { id: { in: ids }, deleted_at: null },
      }),
    );

  countProducts = (ids: string[]): Promise<ResultPattern<number>> =>
    ResultPattern.tryCatchAsync('Infrastructure', CatalogRepository.name, () =>
      this.primaryDatabase.products.count({
        where: { id: { in: ids }, deleted_at: null },
      }),
    );
}
