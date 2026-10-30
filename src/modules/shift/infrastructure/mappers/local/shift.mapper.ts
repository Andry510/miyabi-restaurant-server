import type {
  employee_shifts,
  profiles,
  users,
  work_schedules,
} from '@generated/prisma/client';

//Domain
import { ATTENDANCE_STATUS, SHIFT_STATUS } from '@domain/enums/shared';
import type {
  TShiftOutput,
  TShiftUserOutput,
} from '../../../domain/types/entities';

//Infrastructure
import {
  AttendanceRecordMapper,
  type TAttendanceRecordRow,
} from '@infrastructure/mappers/shared';

type TShiftUserRow = Pick<users, 'id'> & {
  profile: Pick<profiles, 'first_name' | 'last_name'> | null;
};

type TShiftRow = Pick<
  employee_shifts,
  | 'id'
  | 'scheduled_start'
  | 'scheduled_end'
  | 'status'
  | 'note'
  | 'created_at'
  | 'updated_at'
> & {
  work_schedule: Pick<work_schedules, 'id' | 'name'>;
  attendance_record: TAttendanceRecordRow | null;
  user_assignment: {
    user: TShiftUserRow;
  };
};

export class ShiftMapper {
  static toUser = (user: TShiftUserRow): TShiftUserOutput => ({
    id: user.id,
    first_name: user.profile?.first_name ?? '',
    last_name: user.profile?.last_name ?? '',
  });

  static toOutput = (row: TShiftRow, now: Date): TShiftOutput => {
    const status = row.status as SHIFT_STATUS;
    const attendance = AttendanceRecordMapper.toOutput(row.attendance_record);

    return {
      id: row.id,
      user: ShiftMapper.toUser(row.user_assignment.user),
      work_schedule: { ...row.work_schedule },
      scheduled_start: row.scheduled_start,
      scheduled_end: row.scheduled_end,
      status,
      note: row.note,
      attendance_status:
        attendance?.status ??
        (status !== SHIFT_STATUS.CANCELLED && row.scheduled_end <= now
          ? ATTENDANCE_STATUS.ABSENT
          : null),
      attendance,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  };
}
