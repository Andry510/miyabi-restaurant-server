import { Prisma, type PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import {
  ATTENDANCE_STATUS,
  INCIDENT_TYPE,
  SHIFT_STATUS,
} from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { ICheckRepository } from '../../../domain/interfaces/repositories';
import type {
  TCheckCandidate,
  TCheckInInput,
  TCheckOutInput,
} from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';

@Injectable()
export class CheckRepository implements ICheckRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findCandidates = (
    assignmentId: string,
    since: Date,
  ): Promise<ResultPattern<TCheckCandidate[]>> =>
    ResultPattern.tryCatchAsync('Infrastructure', CheckRepository.name, () =>
      this.primaryDatabase.employee_shifts.findMany({
        where: {
          user_assignment_id: assignmentId,
          status: SHIFT_STATUS.SCHEDULED,
          scheduled_end: { gt: since },
          OR: [
            { attendance_record: { is: null } },
            {
              attendance_record: {
                is: { clock_in: { not: null }, clock_out: null },
              },
            },
          ],
        },
        select: {
          id: true,
          scheduled_start: true,
          scheduled_end: true,
          work_schedule: {
            select: { id: true, name: true, late_tolerance_minutes: true },
          },
          attendance_record: {
            select: { id: true, clock_in: true, clock_out: true },
          },
        },
        orderBy: { scheduled_start: 'asc' },
        take: 3,
      }),
    );

  checkIn = (input: TCheckInInput): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      CheckRepository.name,
      async () => {
        try {
          await this.primaryDatabase.attendance_records.create({
            data: {
              employee_shift_id: input.shift_id,
              recorded_by_id: input.user_id,
              clock_in: input.clock_in,
              incidents:
                input.late_minutes === null
                  ? undefined
                  : {
                      create: {
                        type: INCIDENT_TYPE.LATE_ARRIVAL,
                        minutes: input.late_minutes,
                      },
                    },
            },
            select: { id: true },
          });

          return true;
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            return false;
          }

          throw error;
        }
      },
    );

  checkOut = (input: TCheckOutInput): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync('Infrastructure', CheckRepository.name, () =>
      this.primaryDatabase.$transaction(async (transaction) => {
        const { count } = await transaction.attendance_records.updateMany({
          where: { id: input.record_id, clock_out: null },
          data: {
            clock_out: input.clock_out,
            status: ATTENDANCE_STATUS.PRESENT,
          },
        });

        if (count === 0) {
          return false;
        }

        await transaction.employee_shifts.update({
          where: { id: input.shift_id },
          data: { status: SHIFT_STATUS.COMPLETED },
        });

        if (input.early_departure_minutes !== null) {
          await transaction.attendance_incidents.create({
            data: {
              attendance_record_id: input.record_id,
              type: INCIDENT_TYPE.EARLY_DEPARTURE,
              minutes: input.early_departure_minutes,
            },
          });
        }

        return true;
      }),
    );
}
