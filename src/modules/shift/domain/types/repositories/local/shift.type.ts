//Domain
import type { TReference } from '@domain/types/shared';
import type { TShiftUserOutput } from '../../entities';

export type TShiftRange = {
  start: Date;
  end: Date;
};

export type TShiftEmployee =
  | { kind: 'not_found' }
  | { kind: 'inactive' }
  | { kind: 'without_assignment' }
  | { kind: 'ok'; assignment_id: string; user: TShiftUserOutput };

export type TEditableShift = {
  assignment_id: string;
  work_schedule_id: string;
  scheduled_start: Date;
  editable: boolean;
};

export type TCreateShiftsInput = {
  assignment_id: string;
  user: TShiftUserOutput;
  work_schedule: TReference;
  ranges: TShiftRange[];
  note: string | null;
};
