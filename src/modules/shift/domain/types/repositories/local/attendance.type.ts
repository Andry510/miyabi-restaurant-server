//Domain
import type { ATTENDANCE_STATUS, INCIDENT_TYPE } from '@domain/enums/shared';

export type TAttendanceIncident = {
  id: string;
  type: INCIDENT_TYPE;
  justified: boolean;
};

export type TShiftAttendance = {
  id: string;
  scheduled_start: Date;
  scheduled_end: Date;
  cancelled: boolean;
  late_tolerance_minutes: number;
  early_leave_tolerance_minutes: number;
  in_closed_tip_pool: boolean;
  record: {
    id: string;
    status: ATTENDANCE_STATUS;
    clock_in: Date | null;
    clock_out: Date | null;
    incidents: TAttendanceIncident[];
  } | null;
};

export type TCorrectAttendanceInput = {
  shift_id: string;
  clock_in: Date;
  clock_out: Date | null;
  late_minutes: number | null;
  early_departure_minutes: number | null;
  reason: string;
  corrected_by: string | null;
};

export type TJustifyInput = {
  shift_id: string;
  type: INCIDENT_TYPE;
  reason: string;
  justified_by: string | null;
};
