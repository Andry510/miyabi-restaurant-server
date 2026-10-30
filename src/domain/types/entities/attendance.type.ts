//Domain
import type { ATTENDANCE_STATUS, INCIDENT_TYPE } from '@domain/enums/shared';

export type TIncidentOutput = {
  type: INCIDENT_TYPE;
  minutes: number | null;
  description: string | null;
  justification: string | null;
  justified_by: string | null;
  justified_at: Date | null;
};

export type TAttendanceRecordOutput = {
  status: ATTENDANCE_STATUS;
  clock_in: Date | null;
  clock_out: Date | null;
  note: string | null;
  corrected_by: string | null;
  corrected_at: Date | null;
  incidents: TIncidentOutput[];
};
