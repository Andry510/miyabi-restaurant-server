import type { PrismaClient, units } from '@generated/prisma/client';
import type { productsWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IProductRepository } from '../../../domain/interfaces/repositories';
import type { TLocalProductsQuerySchema } from '../../../domain/schemas';
import type { TLocalProductOutput } from '../../../domain/types/entities';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { ProductMapper } from '../../mappers';

@Injectable()
export class ProductRepository implements IProductRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findManyByWorkArea = (
    input: TLocalProductsQuerySchema,
    workAreaId: string,
  ): Promise<ResultPattern<TPaginationRepository<TLocalProductOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ProductRepository.name,
      async () => {
        const where: productsWhereInput = {
          status: true,
          deleted_at: null,
          area_products: {
            some: { work_area_id: workAreaId, deleted_at: null },
          },
        };

        if (input.name) {
          where.name = { contains: input.name, mode: 'insensitive' };
        }

        if (input.barcode) {
          where.barcode = { contains: input.barcode, mode: 'insensitive' };
        }

        if (input.storage_code) {
          where.storage_code = {
            contains: input.storage_code,
            mode: 'insensitive',
          };
        }

        if (input.units.length > 0) {
          where.unit = { in: input.units as units[] };
        }

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
            },
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((product) => ProductMapper.toOutput(product)),
        };
      },
    );
}
