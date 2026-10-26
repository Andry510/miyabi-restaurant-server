//Domain
import type {
  ATTENDANCE_STATUS,
  INCIDENT_TYPE,
  SHIFT_STATUS,
} from '@domain/enums/shared';
import type { TReference } from '@domain/types/shared';

export type TIncidentOutput = {
  type: INCIDENT_TYPE;
  minutes: number | null;
  description: string | null;
};

export type TAttendanceRecordOutput = {
  status: ATTENDANCE_STATUS;
  clock_in: Date | null;
  clock_out: Date | null;
  note: string | null;
  incidents: TIncidentOutput[];
};

export type TShiftOutput = {
  id: string;
  work_schedule: TReference;
  status: SHIFT_STATUS;
  scheduled_start: Date;
  scheduled_end: Date;
  attendance: TAttendanceRecordOutput | null;
};

export type TAgendaDayStatus =
  | 'present'
  | 'partial'
  | 'absent'
  | 'excused'
  | 'scheduled'
  | 'cancelled'
  | 'off';

export type TAgendaDayOutput = {
  date: string;
  status: TAgendaDayStatus;
  shifts: TShiftOutput[];
};

export type TAttendanceSummaryOutput = {
  shifts: number;
  cancelled: number;
  present: number;
  absent: number;
  excused: number;
  incomplete: number;
  without_record: number;
  worked_minutes: number;
  days: Record<TAgendaDayStatus, number>;
};

export type TAttendanceOutput = {
  from: string;
  to: string;
  summary: TAttendanceSummaryOutput;
  days: TAgendaDayOutput[];
};
