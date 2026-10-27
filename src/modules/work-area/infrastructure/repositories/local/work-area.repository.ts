import type { PrismaClient } from '@generated/prisma/client';
import type { work_areasWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IWorkAreaRepository } from '../../../domain/interfaces/repositories';
import type { TWorkAreasQuerySchema } from '../../../domain/schemas';
import type { TWorkAreaOutput } from '../../../domain/types/entities';
import type {
  TCreateWorkAreaInput,
  TRemoveWorkAreaResult,
  TUpdateWorkAreaInput,
} from '../../../domain/types/repositories';

//Infrastructure
import { PRISMA_ERROR_CODE } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager, PrismaError } from '@infrastructure/database';
import { WorkAreaMapper } from '../../mappers';

const WORK_AREA_SELECT = {
  id: true,
  name: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
};

@Injectable()
export class WorkAreaRepository implements IWorkAreaRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findMany = (
    input: TWorkAreasQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TWorkAreaOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkAreaRepository.name,
      async () => {
        const where: work_areasWhereInput = { deleted_at: null };

        if (input.name) {
          where.name = { contains: input.name, mode: 'insensitive' };
        }

        const [count, response] = await Promise.all([
          this.primaryDatabase.work_areas.count({ where }),
          this.primaryDatabase.work_areas.findMany({
            where,
            select: WORK_AREA_SELECT,
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((row) => WorkAreaMapper.toOutput(row)),
        };
      },
    );

  findById = (id: string): Promise<ResultPattern<TWorkAreaOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkAreaRepository.name,
      async () => {
        const response = await this.primaryDatabase.work_areas.findFirst({
          where: { id, deleted_at: null },
          select: WORK_AREA_SELECT,
        });

        return response ? WorkAreaMapper.toOutput(response) : null;
      },
    );

  isNameInUse = (
    name: string,
    exceptId: string | null,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkAreaRepository.name,
      async () => {
        const count = await this.primaryDatabase.work_areas.count({
          where: {
            name: { equals: name, mode: 'insensitive' },
            ...(exceptId ? { id: { not: exceptId } } : {}),
          },
        });

        return count > 0;
      },
    );

  create = (
    input: TCreateWorkAreaInput,
  ): Promise<ResultPattern<TWorkAreaOutput>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkAreaRepository.name,
      async () => {
        const response = await this.primaryDatabase.work_areas.create({
          data: {
            name: input.name,
            description: input.description ?? null,
            area_job_positions:
              input.job_positions_ids.length > 0
                ? {
                    create: input.job_positions_ids.map((id) => ({
                      job_position_id: id,
                    })),
                  }
                : undefined,
          },
          select: WORK_AREA_SELECT,
        });

        return WorkAreaMapper.toOutput(response);
      },
    );

  update = (
    input: TUpdateWorkAreaInput,
  ): Promise<ResultPattern<TWorkAreaOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkAreaRepository.name,
      async () => {
        try {
          const response = await this.primaryDatabase.work_areas.update({
            where: { id: input.id, deleted_at: null },
            data: {
              name: input.name,
              description: input.description,
              status: input.status,
            },
            select: WORK_AREA_SELECT,
          });

          return WorkAreaMapper.toOutput(response);
        } catch (error) {
          if (PrismaError.is(error, PRISMA_ERROR_CODE.NOT_FOUND)) {
            return null;
          }

          throw error;
        }
      },
    );

  softDelete = (id: string): Promise<ResultPattern<TRemoveWorkAreaResult>> =>
    ResultPattern.tryCatchAsync('Infrastructure', WorkAreaRepository.name, () =>
      this.primaryDatabase.$transaction(
        async (transaction): Promise<TRemoveWorkAreaResult> => {
          const exists = await transaction.work_areas.count({
            where: { id, deleted_at: null },
          });

          if (exists === 0) {
            return 'not_found';
          }

          const employees = await transaction.user_assignments.count({
            where: {
              status: true,
              deleted_at: null,
              user: { deleted_at: null },
              area_job_position: { work_area_id: id, deleted_at: null },
            },
          });

          if (employees > 0) {
            return 'has_employees';
          }

          await transaction.work_areas.update({
            where: { id },
            data: { deleted_at: new Date() },
          });

          return 'removed';
        },
      ),
    );
}
