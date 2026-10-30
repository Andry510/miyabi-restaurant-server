import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import {
  ATTENDANCE_STATUS,
  INCIDENT_TYPE,
  SHIFT_STATUS,
} from '@domain/enums/shared';
import { ResultPattern } from '@domain/patterns/results';
import type { IAttendanceRepository } from '../../../domain/interfaces/repositories';
import type {
  TCorrectAttendanceInput,
  TJustifyInput,
  TShiftAttendance,
} from '../../../domain/types/repositories';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';

const CLOCK_INCIDENTS = [
  INCIDENT_TYPE.ABSENCE,
  INCIDENT_TYPE.LATE_ARRIVAL,
  INCIDENT_TYPE.EARLY_DEPARTURE,
];

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findAttendance = (
    id: string,
  ): Promise<ResultPattern<TShiftAttendance | null>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AttendanceRepository.name,
      async () => {
        const response = await this.primaryDatabase.employee_shifts.findUnique({
          where: { id },
          select: {
            id: true,
            scheduled_start: true,
            scheduled_end: true,
            status: true,
            work_schedule: {
              select: {
                late_tolerance_minutes: true,
                early_leave_tolerance_minutes: true,
              },
            },
            tip_pool_shift: {
              select: { tip_pool: { select: { status: true } } },
            },
            attendance_record: {
              select: {
                id: true,
                status: true,
                clock_in: true,
                clock_out: true,
                incidents: {
                  select: { id: true, type: true, justified_at: true },
                },
              },
            },
          },
        });

        if (!response) {
          return null;
        }

        const record = response.attendance_record;

        return {
          id: response.id,
          scheduled_start: response.scheduled_start,
          scheduled_end: response.scheduled_end,
          cancelled: response.status === SHIFT_STATUS.CANCELLED,
          late_tolerance_minutes: response.work_schedule.late_tolerance_minutes,
          early_leave_tolerance_minutes:
            response.work_schedule.early_leave_tolerance_minutes,
          in_closed_tip_pool:
            response.tip_pool_shift?.tip_pool.status === 'closed',
          record: record
            ? {
                id: record.id,
                status: record.status as ATTENDANCE_STATUS,
                clock_in: record.clock_in,
                clock_out: record.clock_out,
                incidents: record.incidents.map((incident) => ({
                  id: incident.id,
                  type: incident.type as INCIDENT_TYPE,
                  justified: incident.justified_at !== null,
                })),
              }
            : null,
        };
      },
    );

  correct = (input: TCorrectAttendanceInput): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AttendanceRepository.name,
      () =>
        this.primaryDatabase.$transaction(async (transaction) => {
          const data = {
            clock_in: input.clock_in,
            clock_out: input.clock_out,
            status: input.clock_out
              ? ATTENDANCE_STATUS.PRESENT
              : ATTENDANCE_STATUS.INCOMPLETE,
            note: input.reason,
            corrected_by: input.corrected_by,
            corrected_at: new Date(),
          };

          const record = await transaction.attendance_records.upsert({
            where: { employee_shift_id: input.shift_id },
            create: { employee_shift_id: input.shift_id, ...data },
            update: data,
            select: { id: true },
          });

          await transaction.attendance_incidents.deleteMany({
            where: {
              attendance_record_id: record.id,
              type: { in: CLOCK_INCIDENTS },
            },
          });

          const incidents = [
            { type: INCIDENT_TYPE.LATE_ARRIVAL, minutes: input.late_minutes },
            {
              type: INCIDENT_TYPE.EARLY_DEPARTURE,
              minutes: input.early_departure_minutes,
            },
          ].filter((incident) => incident.minutes !== null);

          if (incidents.length > 0) {
            await transaction.attendance_incidents.createMany({
              data: incidents.map((incident) => ({
                attendance_record_id: record.id,
                type: incident.type,
                minutes: incident.minutes,
              })),
            });
          }

          await transaction.employee_shifts.update({
            where: { id: input.shift_id },
            data: {
              status: input.clock_out
                ? SHIFT_STATUS.COMPLETED
                : SHIFT_STATUS.SCHEDULED,
            },
          });
        }),
    );

  justifyAbsence = (input: TJustifyInput): Promise<ResultPattern<void>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AttendanceRepository.name,
      async () => {
        await this.primaryDatabase.attendance_records.upsert({
          where: { employee_shift_id: input.shift_id },
          create: {
            employee_shift_id: input.shift_id,
            status: ATTENDANCE_STATUS.EXCUSED,
            incidents: { create: this.justified(input) },
          },
          update: {
            status: ATTENDANCE_STATUS.EXCUSED,
            incidents: { create: this.justified(input) },
          },
          select: { id: true },
        });
      },
    );

  justifyIncident = (
    incidentId: string,
    input: TJustifyInput,
  ): Promise<ResultPattern<boolean>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AttendanceRepository.name,
      async () => {
        const { count } =
          await this.primaryDatabase.attendance_incidents.updateMany({
            where: { id: incidentId, justified_at: null },
            data: {
              justification: input.reason,
              justified_by: input.justified_by,
              justified_at: new Date(),
            },
          });

        return count > 0;
      },
    );

  //Functions
  private justified(input: TJustifyInput): {
    type: INCIDENT_TYPE;
    justification: string;
    justified_by: string | null;
    justified_at: Date;
  } {
    return {
      type: input.type,
      justification: input.reason,
      justified_by: input.justified_by,
      justified_at: new Date(),
    };
  }
}
