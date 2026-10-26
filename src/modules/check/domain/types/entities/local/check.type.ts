//Domain
import type { TReference } from '@domain/types/shared';

export type TCheckState = 'pending' | 'checked_in' | 'completed';

export type TCheckOutput = {
  shift: {
    id: string;
    work_schedule: TReference;
    scheduled_start: Date;
    scheduled_end: Date;
  };
  state: TCheckState;
  clock_in: Date | null;
  clock_out: Date | null;
  check_in_from: Date;
  check_out_until: Date;
  late_minutes: number | null;
  early_departure_minutes: number | null;
};
