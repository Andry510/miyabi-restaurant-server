import type { Prisma, PrismaClient } from '@generated/prisma/client';
import type {
  employee_shiftsWhereInput,
  tip_poolsWhereInput,
} from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { ITipRepository } from '../../../domain/interfaces/repositories';
import type { TPoolsQuerySchema } from '../../../domain/schemas';
import type {
  TCreateTipPoolInput,
  TSaveTipPoolInput,
  TTipCalculation,
  TTipPool,
  TTipPoolHeader,
  TTipShift,
  TTipWindow,
  TTipWriteResult,
} from '../../../domain/types/repositories';

//Infrastructure
import { PRISMA_ERROR_CODE } from '@infrastructure/constants';
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager, PrismaError } from '@infrastructure/database';
import { Money } from '@infrastructure/utils';
import { TipMapper } from '../../mappers';
import { SANCTION_SELECT } from './sanction.repository';

const USER_SELECT = {
  id: true,
  profile: { select: { first_name: true, last_name: true } },
} as const;

const HEADER_SELECT = {
  id: true,
  period: true,
  start_day: true,
  end_day: true,
  work_schedule: { select: { id: true, name: true } },
  amount: true,
  status: true,
  sanction_destination: true,
  sanction_amount: true,
  note: true,
  closed_at: true,
  created_at: true,
  updated_at: true,
} as const;

const AREAS_SELECT = {
  work_area: { select: { id: true, name: true } },
  percentage: true,
  method: true,
  enabled: true,
  amount: true,
  allocations: {
    select: {
      user_assignment_id: true,
      shifts: true,
      sanction_shifts: true,
      weight: true,
      amount: true,
      sanction_amount: true,
      user_assignment: { select: { user: { select: USER_SELECT } } },
    },
  },
} as const;

class ShiftTakenError extends Error {}

const windowWhere = (window: TTipWindow): employee_shiftsWhereInput => ({
  scheduled_start: { gte: window.start, lt: window.end },
  ...(window.work_schedule_id
    ? { work_schedule_id: window.work_schedule_id }
    : {}),
});

@Injectable()
export class TipRepository implements ITipRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  hasOverlap = (
    startDay: string,
    endDay: string,
    workScheduleId: string | null,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      TipRepository.name,
      async () => {
        const count = await this.primaryDatabase.tip_pools.count({
          where: {
            start_day: { lte: TipMapper.toDay(endDay) },
            end_day: { gte: TipMapper.toDay(startDay) },
            ...(workScheduleId
              ? {
                  OR: [
                    { work_schedule_id: null },
                    { work_schedule_id: workScheduleId },
                  ],
                }
              : {}),
          },
          take: 1,
        });

        return count > 0;
      },
    );

  findShifts = (
    window: TTipWindow,
    poolId: string | null,
    now: Date,
  ): Promise<ResultPattern<TTipShift[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      TipRepository.name,
      async () => {
        const response = await this.primaryDatabase.employee_shifts.findMany({
          where: {
            ...windowWhere(window),
            status: { not: 'cancelled' },
            OR: [
              { tip_pool_shift: { is: null } },
              ...(poolId
                ? [{ tip_pool_shift: { is: { tip_pool_id: poolId } } }]
                : []),
            ],
          },
          select: {
            id: true,
            scheduled_end: true,
            attendance_record: {
              select: {
                status: true,
                clock_in: true,
                clock_out: true,
                incidents: { select: { type: true, justified_at: true } },
              },
            },
            user_assignment: {
              select: {
                id: true,
                user: { select: USER_SELECT },
                area_job_position: {
                  select: { work_area_id: true, tip_weight: true },
                },
              },
            },
          },
        });

        return response.map((shift) => TipMapper.toShift(shift, now));
      },
    );

  hasPendingShifts = (
    window: TTipWindow,
    now: Date,
    graceStart: Date,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      TipRepository.name,
      async () => {
        const count = await this.primaryDatabase.employee_shifts.count({
          where: {
            ...windowWhere(window),
            status: 'scheduled',
            OR: [
              { attendance_record: { is: null }, scheduled_end: { gt: now } },
              {
                attendance_record: {
                  is: { clock_in: { not: null }, clock_out: null },
                },
                scheduled_end: { gt: graceStart },
              },
            ],
          },
          take: 1,
        });

        return count > 0;
      },
    );

  create = (
    input: TCreateTipPoolInput,
    calculation: TTipCalculation,
  ): Promise<ResultPattern<TTipWriteResult>> =>
    ResultPattern.tryCatchAsync('Infrastructure', TipRepository.name, () =>
      this.write(async (transaction) => {
        const response = await transaction.tip_pools.create({
          data: {
            period: input.period,
            start_day: TipMapper.toDay(input.start_day),
            end_day: TipMapper.toDay(input.end_day),
            work_schedule_id: input.work_schedule_id,
            amount: Money.toDecimal(input.amount_cents),
            sanction_destination: calculation.destination,
            sanction_amount: Money.toDecimal(calculation.sanction_cents),
            note: input.note,
          },
          select: HEADER_SELECT,
        });

        await this.writeCalculation(transaction, response.id, calculation);

        return TipMapper.toHeader(response);
      }),
    );

  findMany = (
    input: TPoolsQuerySchema,
  ): Promise<ResultPattern<TPaginationRepository<TTipPoolHeader>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      TipRepository.name,
      async () => {
        const where: tip_poolsWhereInput = {
          start_day: {
            gte: TipMapper.toDay(input.from),
            lte: TipMapper.toDay(input.to),
          },
          status: input.status,
        };

        const [count, response] = await Promise.all([
          this.primaryDatabase.tip_pools.count({ where }),
          this.primaryDatabase.tip_pools.findMany({
            where,
            select: HEADER_SELECT,
            orderBy: [{ start_day: 'desc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return { count, data: response.map((row) => TipMapper.toHeader(row)) };
      },
    );

  findById = (id: string): Promise<ResultPattern<TTipPool | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      TipRepository.name,
      async () => {
        const response = await this.primaryDatabase.tip_pools.findUnique({
          where: { id },
          select: {
            ...HEADER_SELECT,
            areas: {
              select: AREAS_SELECT,
              orderBy: { work_area: { name: 'asc' } },
            },
            sanctions: {
              select: SANCTION_SELECT,
              orderBy: { created_at: 'asc' },
            },
          },
        });

        if (!response) {
          return null;
        }

        const { areas, sanctions, ...header } = response;

        return {
          header: TipMapper.toHeader(header),
          areas: areas.map((area) => TipMapper.toAreaCalculation(area)),
          sanctions: sanctions.map((sanction) =>
            TipMapper.toSanction(sanction),
          ),
        };
      },
    );

  exists = (id: string): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      TipRepository.name,
      async () =>
        (await this.primaryDatabase.tip_pools.count({ where: { id } })) > 0,
    );

  save = (
    id: string,
    input: TSaveTipPoolInput,
    calculation: TTipCalculation,
  ): Promise<ResultPattern<TTipWriteResult>> =>
    ResultPattern.tryCatchAsync('Infrastructure', TipRepository.name, () =>
      this.write(async (transaction) => {
        const response = await transaction.tip_pools.update({
          where: { id, status: 'open' },
          data: {
            amount:
              input.amount_cents === undefined
                ? undefined
                : Money.toDecimal(input.amount_cents),
            sanction_destination: calculation.destination,
            sanction_amount: Money.toDecimal(calculation.sanction_cents),
            note: input.note,
            status: input.close ? 'closed' : undefined,
            closed_at: input.close ? new Date() : undefined,
          },
          select: HEADER_SELECT,
        });

        await this.writeCalculation(transaction, id, calculation);

        return TipMapper.toHeader(response);
      }),
    );

  reopen = (id: string): Promise<ResultPattern<TTipPoolHeader | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      TipRepository.name,
      async () => {
        try {
          const response = await this.primaryDatabase.tip_pools.update({
            where: { id, status: 'closed' },
            data: { status: 'open', closed_at: null },
            select: HEADER_SELECT,
          });

          return TipMapper.toHeader(response);
        } catch (error) {
          if (PrismaError.is(error, PRISMA_ERROR_CODE.NOT_FOUND)) {
            return null;
          }

          throw error;
        }
      },
    );

  remove = (id: string): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      TipRepository.name,
      async () => {
        const { count } = await this.primaryDatabase.tip_pools.deleteMany({
          where: { id, status: 'open' },
        });

        return count > 0;
      },
    );

  //Functions
  private async write(
    run: (transaction: Prisma.TransactionClient) => Promise<TTipPoolHeader>,
  ): Promise<TTipWriteResult> {
    try {
      const header = await this.primaryDatabase.$transaction(run);

      return { kind: 'ok', header };
    } catch (error) {
      if (PrismaError.is(error, PRISMA_ERROR_CODE.NOT_FOUND)) {
        return { kind: 'not_open' };
      }

      if (
        error instanceof ShiftTakenError ||
        PrismaError.is(error, PRISMA_ERROR_CODE.UNIQUE)
      ) {
        return { kind: 'shift_taken' };
      }

      throw error;
    }
  }

  private async writeCalculation(
    transaction: Prisma.TransactionClient,
    poolId: string,
    calculation: TTipCalculation,
  ): Promise<void> {
    await transaction.tip_pool_areas.deleteMany({
      where: { tip_pool_id: poolId },
    });
    await transaction.tip_pool_shifts.deleteMany({
      where: { tip_pool_id: poolId },
    });

    for (const area of calculation.areas) {
      await transaction.tip_pool_areas.create({
        data: {
          tip_pool_id: poolId,
          work_area_id: area.work_area.id,
          percentage: Money.toDecimal(area.percentage_bp),
          method: area.method,
          enabled: area.enabled,
          amount: Money.toDecimal(area.amount_cents),
          allocations: {
            createMany: {
              data: area.allocations.map((allocation) => ({
                user_assignment_id: allocation.assignment_id,
                shifts: Money.toDecimal(allocation.shifts_bp),
                sanction_shifts: Money.toDecimal(allocation.sanction_shifts_bp),
                weight: Money.toDecimal(allocation.weight_bp),
                amount: Money.toDecimal(allocation.amount_cents),
                sanction_amount: Money.toDecimal(allocation.sanction_cents),
              })),
            },
          },
        },
        select: { id: true },
      });
    }

    if (calculation.shift_ids.length === 0) {
      return;
    }

    const { count } = await transaction.tip_pool_shifts.createMany({
      data: calculation.shift_ids.map((shiftId) => ({
        tip_pool_id: poolId,
        employee_shift_id: shiftId,
      })),
      skipDuplicates: true,
    });

    if (count !== calculation.shift_ids.length) {
      throw new ShiftTakenError();
    }
  }
}
