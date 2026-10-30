//Domain
import type { TReference } from '@domain/types/shared';
import type { TShiftUserOutput } from '../../entities';

export type TWeekSourceShift = {
  id: string;
  scheduled_start: Date;
  note: string | null;
  assignment_id: string;
  active_employee: boolean;
  user: TShiftUserOutput;
  work_schedule: TReference & {
    start_time: string;
    end_time: string;
    active: boolean;
  };
};

export type TWeekCopy = {
  assignment_id: string;
  user: TShiftUserOutput;
  work_schedule: TReference;
  start: Date;
  end: Date;
  note: string | null;
};
