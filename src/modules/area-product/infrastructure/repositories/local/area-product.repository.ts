import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IAreaProductRepository } from '../../../domain/interfaces/repositories';
import type { TLinksQuerySchema } from '../../../domain/schemas';
import type {
  TAreaProductOutput,
  TProductAreaOutput,
} from '../../../domain/types/entities';
import type {
  TLinkPair,
  TUnlinkResult,
} from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { AreaProductMapper } from '../../mappers';

@Injectable()
export class AreaProductRepository implements IAreaProductRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findProductsByWorkArea = (
    workAreaId: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TAreaProductOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaProductRepository.name,
      async () => {
        const where = {
          deleted_at: null,
          area_products: {
            some: { work_area_id: workAreaId, deleted_at: null },
          },
        };

        const [count, response] = await Promise.all([
          this.primaryDatabase.products.count({ where }),
          this.primaryDatabase.products.findMany({
            where,
            select: {
              id: true,
              name: true,
              picture: true,
              barcode: true,
              storage_code: true,
              unit: true,
              status: true,
            },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((row) => AreaProductMapper.toProductOutput(row)),
        };
      },
    );

  findWorkAreasByProduct = (
    productId: string,
    input: TLinksQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TProductAreaOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaProductRepository.name,
      async () => {
        const where = {
          deleted_at: null,
          area_products: {
            some: { product_id: productId, deleted_at: null },
          },
        };

        const [count, response] = await Promise.all([
          this.primaryDatabase.work_areas.count({ where }),
          this.primaryDatabase.work_areas.findMany({
            where,
            select: { id: true, name: true, description: true, status: true },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((row) => AreaProductMapper.toWorkAreaOutput(row)),
        };
      },
    );

  link = (pairs: TLinkPair[]): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaProductRepository.name,
      async () => {
        await this.primaryDatabase.$transaction([
          this.primaryDatabase.area_products.createMany({
            data: pairs,
            skipDuplicates: true,
          }),
          this.primaryDatabase.area_products.updateMany({
            where: { OR: pairs, deleted_at: { not: null } },
            data: { deleted_at: null },
          }),
        ]);
      },
    );

  unlink = (pairs: TLinkPair[]): Promise<ResultPattern<TUnlinkResult>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AreaProductRepository.name,
      () =>
        this.primaryDatabase.$transaction(
          async (transaction): Promise<TUnlinkResult> => {
            const where = { OR: pairs, deleted_at: null };

            const linked = await transaction.area_products.count({ where });

            if (linked !== pairs.length) {
              return 'not_linked';
            }

            await transaction.area_products.updateMany({
              where,
              data: { deleted_at: new Date() },
            });

            return 'unlinked';
          },
        ),
    );
}
