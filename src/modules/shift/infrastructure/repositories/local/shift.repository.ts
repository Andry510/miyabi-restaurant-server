import type { PrismaClient } from '@generated/prisma/client';
import type { employee_shiftsWhereInput } from '@generated/prisma/models';
import { Injectable } from '@nestjs/common';

//Domain
import type { SHIFT_STATUS } from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { TPaginationRepository } from '@domain/types/shared';
import type { IShiftRepository } from '../../../domain/interfaces/repositories';
import type { TShiftsQuerySchema } from '../../../domain/schemas';
import type { TShiftOutput } from '../../../domain/types/entities';
import type {
  TCreateShiftsInput,
  TEditableShift,
  TShiftEmployee,
  TShiftRange,
} from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { ShiftMapper } from '../../mappers';

const SHIFT_SELECT = {
  id: true,
  scheduled_start: true,
  scheduled_end: true,
  status: true,
  note: true,
  created_at: true,
  updated_at: true,
  work_schedule: { select: { id: true, name: true } },
  attendance_record: { select: { id: true } },
  user_assignment: {
    select: {
      user: {
        select: {
          id: true,
          profile: { select: { first_name: true, last_name: true } },
        },
      },
    },
  },
} as const;

const EDITABLE: employee_shiftsWhereInput = {
  status: 'scheduled',
  attendance_record: { is: null },
};

@Injectable()
export class ShiftRepository implements IShiftRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findMany = (
    input: TShiftsQuerySchema,
    range: TShiftRange,
  ): Promise<ResultPattern<TPaginationRepository<TShiftOutput>>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ShiftRepository.name,
      async () => {
        const where: employee_shiftsWhereInput = {
          scheduled_start: { gte: range.start, lt: range.end },
          status: input.status,
          work_schedule_id: input.work_schedule_id,
          user_assignment: input.user_id
            ? { user_id: input.user_id }
            : undefined,
        };

        const [count, response] = await Promise.all([
          this.primaryDatabase.employee_shifts.count({ where }),
          this.primaryDatabase.employee_shifts.findMany({
            where,
            select: SHIFT_SELECT,
            orderBy: [{ scheduled_start: 'asc' }, { id: 'asc' }],
            skip: input.skip,
            take: input.take,
          }),
        ]);

        return {
          count,
          data: response.map((row) => ShiftMapper.toOutput(row)),
        };
      },
    );

  findById = (id: string): Promise<ResultPattern<TShiftOutput | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ShiftRepository.name,
      async () => {
        const response = await this.primaryDatabase.employee_shifts.findUnique({
          where: { id },
          select: SHIFT_SELECT,
        });

        return response ? ShiftMapper.toOutput(response) : null;
      },
    );

  findEditable = (id: string): Promise<ResultPattern<TEditableShift | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ShiftRepository.name,
      async () => {
        const response = await this.primaryDatabase.employee_shifts.findUnique({
          where: { id },
          select: {
            user_assignment_id: true,
            work_schedule_id: true,
            scheduled_start: true,
            status: true,
            attendance_record: { select: { id: true } },
          },
        });

        if (!response) {
          return null;
        }

        return {
          assignment_id: response.user_assignment_id,
          work_schedule_id: response.work_schedule_id,
          scheduled_start: response.scheduled_start,
          editable:
            response.status === 'scheduled' && !response.attendance_record,
        };
      },
    );

  findEmployee = (userId: string): Promise<ResultPattern<TShiftEmployee>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ShiftRepository.name,
      async (): Promise<TShiftEmployee> => {
        const response = await this.primaryDatabase.users.findFirst({
          where: { id: userId, deleted_at: null },
          select: {
            id: true,
            status: true,
            profile: { select: { first_name: true, last_name: true } },
            assignments: {
              where: { status: true, deleted_at: null },
              select: { id: true },
              take: 1,
            },
          },
        });

        if (!response) {
          return { kind: 'not_found' };
        }

        if (!response.status) {
          return { kind: 'inactive' };
        }

        const assignment = response.assignments.at(0);

        if (!assignment) {
          return { kind: 'without_assignment' };
        }

        return {
          kind: 'ok',
          assignment_id: assignment.id,
          user: ShiftMapper.toUser(response),
        };
      },
    );

  hasOverlap = (
    assignmentId: string,
    ranges: TShiftRange[],
    exceptShiftId: string | null,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ShiftRepository.name,
      async () => {
        const count = await this.primaryDatabase.employee_shifts.count({
          where: {
            user_assignment_id: assignmentId,
            status: { not: 'cancelled' },
            ...(exceptShiftId ? { id: { not: exceptShiftId } } : {}),
            OR: ranges.map((range) => ({
              scheduled_start: { lt: range.end },
              scheduled_end: { gt: range.start },
            })),
          },
        });

        return count > 0;
      },
    );

  createMany = (
    input: TCreateShiftsInput,
  ): Promise<ResultPattern<TShiftOutput[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ShiftRepository.name,
      async () => {
        const response =
          await this.primaryDatabase.employee_shifts.createManyAndReturn({
            data: input.ranges.map((range) => ({
              user_assignment_id: input.assignment_id,
              work_schedule_id: input.work_schedule.id,
              scheduled_start: range.start,
              scheduled_end: range.end,
              note: input.note,
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

        return response.map((row) => ({
          ...row,
          status: row.status as SHIFT_STATUS,
          user: input.user,
          work_schedule: input.work_schedule,
          has_attendance: false,
        }));
      },
    );

  reschedule = (
    id: string,
    data: { work_schedule_id: string; range: TShiftRange; note?: string },
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ShiftRepository.name,
      async () => {
        const { count } = await this.primaryDatabase.employee_shifts.updateMany(
          {
            where: { id, ...EDITABLE },
            data: {
              work_schedule_id: data.work_schedule_id,
              scheduled_start: data.range.start,
              scheduled_end: data.range.end,
              note: data.note,
            },
          },
        );

        return count > 0;
      },
    );

  cancel = (id: string): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      ShiftRepository.name,
      async () => {
        const { count } = await this.primaryDatabase.employee_shifts.updateMany(
          {
            where: { id, ...EDITABLE },
            data: { status: 'cancelled' },
          },
        );

        return count > 0;
      },
    );
}
