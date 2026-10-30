import type { PrismaClient } from '@generated/prisma/client';
import { Injectable } from '@nestjs/common';

//Domain
import { ResultPattern } from '@domain/patterns/results';
import type { IAttendanceRepository } from '../../../domain/interfaces/repositories';
import type { TShiftOutput } from '../../../domain/types/entities';

//Infrastructure
// oxlint-disable-next-line typescript/consistent-type-imports
import { DatabaseManager } from '@infrastructure/database';
import { ATTENDANCE_RECORD_SELECT } from '@infrastructure/mappers/shared';
import { AttendanceMapper } from '../../mappers';

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
  private readonly primaryDatabase: PrismaClient;

  constructor(databaseManager: DatabaseManager) {
    this.primaryDatabase = databaseManager.PrimaryDBClient;
  }

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
            work_schedule: { select: { id: true, name: true } },
            attendance_record: { select: ATTENDANCE_RECORD_SELECT },
          },
          orderBy: [{ scheduled_start: 'asc' }, { id: 'asc' }],
        });

        return response.map((shift) => AttendanceMapper.toShiftOutput(shift));
      },
    );
}
