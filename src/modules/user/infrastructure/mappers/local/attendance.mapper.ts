import type { employee_shifts, work_schedules } from '@generated/prisma/client';

//Domain
import type { SHIFT_STATUS } from '@domain/enums/shared';
import type { TShiftOutput } from '../../../domain/types/entities';

//Infrastructure
import {
  AttendanceRecordMapper,
  type TAttendanceRecordRow,
} from '@infrastructure/mappers/shared';

type TShiftRow = Pick<
  employee_shifts,
  'id' | 'status' | 'scheduled_start' | 'scheduled_end'
> & {
  work_schedule: Pick<work_schedules, 'id' | 'name'>;
  attendance_record: TAttendanceRecordRow | null;
};

export class AttendanceMapper {
  static toShiftOutput = (row: TShiftRow): TShiftOutput => ({
    id: row.id,
    work_schedule: { ...row.work_schedule },
    status: row.status as SHIFT_STATUS,
    scheduled_start: row.scheduled_start,
    scheduled_end: row.scheduled_end,
    attendance: AttendanceRecordMapper.toOutput(row.attendance_record),
  });
}
