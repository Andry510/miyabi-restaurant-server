//Domain
import type { ATTENDANCE_STATUS, SHIFT_STATUS } from '@domain/enums/shared';
import type { TAttendanceRecordOutput } from '@domain/types/entities';
import type { TReference } from '@domain/types/shared';

export type TShiftUserOutput = {
  id: string;
  first_name: string;
  last_name: string;
};

export type TShiftOutput = {
  id: string;
  user: TShiftUserOutput;
  work_schedule: TReference;
  scheduled_start: Date;
  scheduled_end: Date;
  status: SHIFT_STATUS;
  note: string | null;
  attendance_status: ATTENDANCE_STATUS | null;
  attendance: TAttendanceRecordOutput | null;
  created_at: Date;
  updated_at: Date;
};

export type TCopySkipReason =
  'past' | 'overlap' | 'employee_inactive' | 'schedule_inactive';

export type TCopyWeekOutput = {
  created: TShiftOutput[];
  skipped: Array<{
    shift_id: string;
    user: TShiftUserOutput;
    date: string;
    reason: TCopySkipReason;
  }>;
};
