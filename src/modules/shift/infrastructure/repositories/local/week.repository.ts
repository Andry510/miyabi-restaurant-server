import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import type { SHIFT_STATUS } from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { IWeekRepository } from '../../../domain/interfaces/repositories';
import type { TShiftOutput } from '../../../domain/types/entities';
import type {
  TShiftRange,
  TWeekCopy,
  TWeekSourceShift,
} from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { ShiftMapper } from '../../mappers';

const toTime = (value: Date): string => value.toISOString().slice(11, 16);

@Injectable()
export class WeekRepository implements IWeekRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findSource = (
    range: TShiftRange,
    userIds: string[] | undefined,
  ): Promise<ResultPattern<TWeekSourceShift[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WeekRepository.name,
      async () => {
        const response = await this.primaryDatabase.employee_shifts.findMany({
          where: {
            scheduled_start: { gte: range.start, lt: range.end },
            status: { not: 'cancelled' },
            user_assignment: userIds ? { user_id: { in: userIds } } : undefined,
          },
          select: {
            id: true,
            scheduled_start: true,
            note: true,
            user_assignment: {
              select: {
                id: true,
                status: true,
                deleted_at: true,
                user: {
                  select: {
                    id: true,
                    status: true,
                    deleted_at: true,
                    profile: { select: { first_name: true, last_name: true } },
                  },
                },
              },
            },
            work_schedule: {
              select: {
                id: true,
                name: true,
                start_time: true,
                end_time: true,
                status: true,
                deleted_at: true,
              },
            },
          },
          orderBy: [{ scheduled_start: 'asc' }, { id: 'asc' }],
        });

        return response.map((row) => {
          const { user_assignment: assignment, work_schedule: schedule } = row;

          return {
            id: row.id,
            scheduled_start: row.scheduled_start,
            note: row.note,
            assignment_id: assignment.id,
            active_employee:
              assignment.status &&
              !assignment.deleted_at &&
              assignment.user.status &&
              !assignment.user.deleted_at,
            user: ShiftMapper.toUser(assignment.user),
            work_schedule: {
              id: schedule.id,
              name: schedule.name,
              start_time: toTime(schedule.start_time),
              end_time: toTime(schedule.end_time),
              active: schedule.status && !schedule.deleted_at,
            },
          };
        });
      },
    );

  findBusy = (
    assignmentIds: string[],
    range: TShiftRange,
  ): Promise<ResultPattern<Array<TShiftRange & { assignment_id: string }>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WeekRepository.name,
      async () => {
        const response = await this.primaryDatabase.employee_shifts.findMany({
          where: {
            user_assignment_id: { in: assignmentIds },
            status: { not: 'cancelled' },
            scheduled_start: { lt: range.end },
            scheduled_end: { gt: range.start },
          },
          select: {
            user_assignment_id: true,
            scheduled_start: true,
            scheduled_end: true,
          },
        });

        return response.map((row) => ({
          assignment_id: row.user_assignment_id,
          start: row.scheduled_start,
          end: row.scheduled_end,
        }));
      },
    );

  createCopies = (
    copies: TWeekCopy[],
  ): Promise<ResultPattern<TShiftOutput[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      WeekRepository.name,
      async () => {
        const response =
          await this.primaryDatabase.employee_shifts.createManyAndReturn({
            data: copies.map((copy) => ({
              user_assignment_id: copy.assignment_id,
              work_schedule_id: copy.work_schedule.id,
              scheduled_start: copy.start,
              scheduled_end: copy.end,
              note: copy.note,
            })),
            select: {
              id: true,
              scheduled_start: true,
              scheduled_end: true,
              status: true,
              note: true,
              created_at: true,
              updated_at: true,
            },
          });

        return response.map((row, index) => ({
          ...row,
          status: row.status as SHIFT_STATUS,
          user: copies[index].user,
          work_schedule: copies[index].work_schedule,
          attendance_status: null,
          attendance: null,
        }));
      },
    );
}
