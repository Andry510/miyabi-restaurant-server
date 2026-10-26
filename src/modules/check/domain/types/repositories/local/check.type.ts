//Domain
import type { TReference } from '@domain/types/shared';

export type TCheckCandidate = {
  id: string;
  scheduled_start: Date;
  scheduled_end: Date;
  work_schedule: TReference & { late_tolerance_minutes: number };
  attendance_record: {
    id: string;
    clock_in: Date | null;
    clock_out: Date | null;
  } | null;
};

export type TCheckInInput = {
  shift_id: string;
  user_id: string;
  clock_in: Date;
  late_minutes: number | null;
};

export type TCheckOutInput = {
  record_id: string;
  shift_id: string;
  clock_out: Date;
  early_departure_minutes: number | null;
};
