import { Prisma, type PrismaClient } from '@generated/prisma/client';
import type { work_schedulesWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IWorkScheduleRepository } from '../../../domain/interfaces/repositories';
import type {
  TRegisterSchema,
  TWorkSchedulesQuerySchema,
} from '../../../domain/schemas';
import type { TWorkScheduleOutput } from '../../../domain/types/entities';
import type {
  TRemoveWorkScheduleResult,
  TUpdateWorkScheduleInput,
} from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { WorkScheduleMapper } from '../../mappers';

const WORK_SCHEDULE_SELECT = {
  id: true,
  name: true,
  start_time: true,
  end_time: true,
  break_minutes: true,
  late_tolerance_minutes: true,
  status: true,
  created_at: true,
  updated_at: true,
};

const toTime = (value: string | undefined): Date | undefined =>
  value === undefined ? undefined : WorkScheduleMapper.toTime(value);

@Injectable()
export class WorkScheduleRepository implements IWorkScheduleRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findMany = (
    input: TWorkSchedulesQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TWorkScheduleOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkScheduleRepository.name,
      async () => {
        const where: work_schedulesWhereInput = { deleted_at: null };

        if (input.name) {
          where.name = { contains: input.name, mode: 'insensitive' };
        }

        const [count, response] = await Promise.all([
          this.primaryDatabase.work_schedules.count({ where }),
          this.primaryDatabase.work_schedules.findMany({
            where,
            select: WORK_SCHEDULE_SELECT,
            orderBy: [{ start_time: 'asc' }, { name: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((row) => WorkScheduleMapper.toOutput(row)),
        };
      },
    );

  findById = (id: string): Promise<ResultPattern<TWorkScheduleOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkScheduleRepository.name,
      async () => {
        const response = await this.primaryDatabase.work_schedules.findFirst({
          where: { id, deleted_at: null },
          select: WORK_SCHEDULE_SELECT,
        });

        return response ? WorkScheduleMapper.toOutput(response) : null;
      },
    );

  create = (
    input: TRegisterSchema,
  ): Promise<ResultPattern<TWorkScheduleOutput>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkScheduleRepository.name,
      async () => {
        const response = await this.primaryDatabase.work_schedules.create({
          data: {
            name: input.name,
            start_time: WorkScheduleMapper.toTime(input.start_time),
            end_time: WorkScheduleMapper.toTime(input.end_time),
            break_minutes: input.break_minutes,
            late_tolerance_minutes: input.late_tolerance_minutes,
          },
          select: WORK_SCHEDULE_SELECT,
        });

        return WorkScheduleMapper.toOutput(response);
      },
    );

  update = (
    input: TUpdateWorkScheduleInput,
  ): Promise<ResultPattern<TWorkScheduleOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkScheduleRepository.name,
      async () => {
        try {
          const response = await this.primaryDatabase.work_schedules.update({
            where: { id: input.id, deleted_at: null },
            data: {
              name: input.name,
              start_time: toTime(input.start_time),
              end_time: toTime(input.end_time),
              break_minutes: input.break_minutes,
              late_tolerance_minutes: input.late_tolerance_minutes,
              status: input.status,
            },
            select: WORK_SCHEDULE_SELECT,
          });

          return WorkScheduleMapper.toOutput(response);
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

  softDelete = (
    id: string,
  ): Promise<ResultPattern<TRemoveWorkScheduleResult>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WorkScheduleRepository.name,
      () =>
        this.primaryDatabase.$transaction(
          async (transaction): Promise<TRemoveWorkScheduleResult> => {
            const exists = await transaction.work_schedules.count({
              where: { id, deleted_at: null },
            });

            if (exists === 0) {
              return 'not_found';
            }

            const scheduled = await transaction.employee_shifts.count({
              where: {
                work_schedule_id: id,
                status: 'scheduled',
                scheduled_end: { gt: new Date() },
              },
            });

            if (scheduled > 0) {
              return 'has_scheduled_shifts';
            }

            await transaction.work_schedules.update({
              where: { id },
              data: { deleted_at: new Date() },
            });

            return 'removed';
          },
        ),
    );
}
