import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import type { TIP_PERIOD } from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { IAllocationRepository } from '../../../domain/interfaces/repositories';
import type { TMyTipOutput } from '../../../domain/types/entities';
import type { TManualAllocation } from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { Money } from '@infrastructure/utils';
import { TipMapper } from '../../mappers';

@Injectable()
export class AllocationRepository implements IAllocationRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  setManual = (
    id: string,
    workAreaId: string,
    allocations: TManualAllocation[],
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AllocationRepository.name,
      () =>
        this.primaryDatabase.$transaction(async (transaction) => {
          const area = await transaction.tip_pool_areas.findFirst({
            where: {
              tip_pool_id: id,
              work_area_id: workAreaId,
              tip_pool: { status: 'open' },
            },
            select: { id: true },
          });

          if (!area) {
            return false;
          }

          await transaction.tip_pool_areas.update({
            where: { id: area.id },
            data: { method: 'manual' },
          });

          await transaction.tip_allocations.updateMany({
            where: { tip_pool_area_id: area.id },
            data: { amount: Money.toDecimal(0) },
          });

          for (const allocation of allocations) {
            await transaction.tip_allocations.updateMany({
              where: {
                tip_pool_area_id: area.id,
                user_assignment_id: allocation.assignment_id,
              },
              data: { amount: Money.toDecimal(allocation.amount_cents) },
            });
          }

          return true;
        }),
    );

  findMine = (
    assignmentId: string,
    from: string,
    to: string,
  ): Promise<ResultPattern<TMyTipOutput[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AllocationRepository.name,
      async () => {
        const response = await this.primaryDatabase.tip_allocations.findMany({
          where: {
            user_assignment_id: assignmentId,
            tip_pool_area: {
              tip_pool: {
                status: 'closed',
                start_day: {
                  gte: TipMapper.toDay(from),
                  lte: TipMapper.toDay(to),
                },
              },
            },
          },
          select: {
            minutes: true,
            amount: true,
            tip_pool_area: {
              select: {
                work_area: { select: { id: true, name: true } },
                tip_pool: {
                  select: {
                    id: true,
                    period: true,
                    start_day: true,
                    end_day: true,
                    work_schedule: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
          orderBy: { tip_pool_area: { tip_pool: { start_day: 'asc' } } },
        });

        return response.map((row) => {
          const pool = row.tip_pool_area.tip_pool;

          return {
            pool: {
              id: pool.id,
              period: pool.period as TIP_PERIOD,
              start_day: TipMapper.fromDay(pool.start_day),
              end_day: TipMapper.fromDay(pool.end_day),
              work_schedule: pool.work_schedule,
            },
            work_area: row.tip_pool_area.work_area,
            minutes: row.minutes,
            amount: Money.fromCents(Money.toCents(row.amount)),
          };
        });
      },
    );
}
