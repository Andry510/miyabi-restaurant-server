import { Prisma, type PrismaClient } from '@generated/prisma/client';
import type { job_positionsWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IJobPositionRepository } from '../../../domain/interfaces/repositories';
import type { TJobPositionsQuerySchema } from '../../../domain/schemas';
import type { TJobPositionOutput } from '../../../domain/types/entities';
import type {
  TCreateJobPositionInput,
  TRemoveJobPositionResult,
  TUpdateJobPositionInput,
} from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { JobPositionMapper } from '../../mappers';

const JOB_POSITION_SELECT = {
  id: true,
  name: true,
  description: true,
  status: true,
  created_at: true,
  updated_at: true,
};

@Injectable()
export class JobPositionRepository implements IJobPositionRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findMany = (
    input: TJobPositionsQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TJobPositionOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JobPositionRepository.name,
      async () => {
        const where: job_positionsWhereInput = { deleted_at: null };

        if (input.name) {
          where.name = { contains: input.name, mode: 'insensitive' };
        }

        const [count, response] = await Promise.all([
          this.primaryDatabase.job_positions.count({ where }),
          this.primaryDatabase.job_positions.findMany({
            where,
            select: JOB_POSITION_SELECT,
            orderBy: [{ name: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((row) => JobPositionMapper.toOutput(row)),
        };
      },
    );

  findById = (id: string): Promise<ResultPattern<TJobPositionOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JobPositionRepository.name,
      async () => {
        const response = await this.primaryDatabase.job_positions.findFirst({
          where: { id, deleted_at: null },
          select: JOB_POSITION_SELECT,
        });

        return response ? JobPositionMapper.toOutput(response) : null;
      },
    );

  isNameInUse = (
    name: string,
    exceptId: string | null,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JobPositionRepository.name,
      async () => {
        const count = await this.primaryDatabase.job_positions.count({
          where: {
            name: { equals: name, mode: 'insensitive' },
            ...(exceptId ? { id: { not: exceptId } } : {}),
          },
        });

        return count > 0;
      },
    );

  create = (
    input: TCreateJobPositionInput,
  ): Promise<ResultPattern<TJobPositionOutput>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JobPositionRepository.name,
      async () => {
        const response = await this.primaryDatabase.job_positions.create({
          data: {
            name: input.name,
            description: input.description ?? null,
            area_job_positions:
              input.work_areas_ids.length > 0
                ? {
                    create: input.work_areas_ids.map((id) => ({
                      work_area_id: id,
                    })),
                  }
                : undefined,
          },
          select: JOB_POSITION_SELECT,
        });

        return JobPositionMapper.toOutput(response);
      },
    );

  update = (
    input: TUpdateJobPositionInput,
  ): Promise<ResultPattern<TJobPositionOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JobPositionRepository.name,
      async () => {
        try {
          const response = await this.primaryDatabase.job_positions.update({
            where: { id: input.id, deleted_at: null },
            data: {
              name: input.name,
              description: input.description,
              status: input.status,
            },
            select: JOB_POSITION_SELECT,
          });

          return JobPositionMapper.toOutput(response);
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            return null;
          }

          throw error;
        }
      },
    );

  softDelete = (id: string): Promise<ResultPattern<TRemoveJobPositionResult>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      JobPositionRepository.name,
      () =>
        this.primaryDatabase.$transaction(
          async (transaction): Promise<TRemoveJobPositionResult> => {
            const exists = await transaction.job_positions.count({
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
                area_job_position: { job_position_id: id, deleted_at: null },
              },
            });

            if (employees > 0) {
              return 'has_employees';
            }

            await transaction.job_positions.update({
              where: { id },
              data: { deleted_at: new Date() },
            });

            return 'removed';
          },
        ),
    );
}
