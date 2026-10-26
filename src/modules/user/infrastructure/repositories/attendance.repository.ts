import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { IAttendanceRepository } from '../../domain/interfaces/repositories';
import type { TShiftOutput } from '../../domain/types/entities';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { SERVER_SETTINGS_ID } from '@infrastructure/constants';
import { AttendanceMapper } from '../mappers';

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

  findTimezone = (): Promise<ResultPattern<string>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AttendanceRepository.name,
      async () => {
        const response = await this.primaryDatabase.server_settings.upsert({
          where: { id: SERVER_SETTINGS_ID },
          create: { id: SERVER_SETTINGS_ID },
          update: {},
          select: { timezone: true },
        });

        return response.timezone;
      },
    );

  findShiftsByUser = (
    userId: string,
    start: Date,
    end: Date,
  ): Promise<ResultPattern<TShiftOutput[]>> =>
    ResultPattern.tryCatchAsync(
      'Infrastructure',
      AttendanceRepository.name,
      async () => {
        const response = await this.primaryDatabase.employee_shifts.findMany({
          where: {
            user_assignment: { user_id: userId },
            scheduled_start: { gte: start, lt: end },
          },
          select: {
            id: true,
            status: true,
            scheduled_start: true,
            scheduled_end: true,
            work_schedule: { select: { name: true } },
            attendance_record: {
              select: {
                status: true,
                clock_in: true,
                clock_out: true,
                note: true,
                incidents: {
                  select: { type: true, minutes: true, description: true },
                  orderBy: { created_at: 'asc' },
                },
              },
            },
          },
          orderBy: [{ scheduled_start: 'asc' }, { id: 'asc' }],
        });

        return response.map((shift) => AttendanceMapper.toShiftOutput(shift));
      },
    );
}
