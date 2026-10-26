//Domain
import type { SHIFT_STATUS } from '@domain/enums/shared';
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
  has_attendance: boolean;
  created_at: Date;
  updated_at: Date;
};
