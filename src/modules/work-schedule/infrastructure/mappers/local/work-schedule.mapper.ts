import type { work_schedules } from '@generated/prisma/client';

//Domain
import type { TWorkScheduleOutput } from '../../../domain/types/entities';

type TWorkScheduleRow = Pick<
  work_schedules,
  | 'id'
  | 'name'
  | 'start_time'
  | 'end_time'
  | 'break_minutes'
  | 'late_tolerance_minutes'
  | 'status'
  | 'created_at'
  | 'updated_at'
>;

export class WorkScheduleMapper {
  static toTime = (value: string): Date => new Date(`1970-01-01T${value}:00Z`);

  static fromTime = (value: Date): string => value.toISOString().slice(11, 16);

  static toOutput = (row: TWorkScheduleRow): TWorkScheduleOutput => ({
    ...row,
    start_time: WorkScheduleMapper.fromTime(row.start_time),
    end_time: WorkScheduleMapper.fromTime(row.end_time),
  });
}
