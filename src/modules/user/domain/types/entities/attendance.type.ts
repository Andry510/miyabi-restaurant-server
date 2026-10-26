export type TIncidentOutput = {
  type: string;
  minutes: number | null;
  description: string | null;
};

export type TAttendanceStatus = 'present' | 'absent' | 'excused' | 'incomplete';

export type TAttendanceRecordOutput = {
  status: TAttendanceStatus;
  clock_in: Date | null;
  clock_out: Date | null;
  note: string | null;
  incidents: TIncidentOutput[];
};

export type TShiftOutput = {
  id: string;
  schedule: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduled_start: Date;
  scheduled_end: Date;
  attendance: TAttendanceRecordOutput | null;
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
};

export type TAttendanceOutput = {
  from: string;
  to: string;
  summary: TAttendanceSummaryOutput;
  shifts: TShiftOutput[];
};
