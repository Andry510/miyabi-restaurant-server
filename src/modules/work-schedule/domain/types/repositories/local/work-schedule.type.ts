//Domain
import type { TUpdateBodySchema } from '../../../schemas';

export type TUpdateWorkScheduleInput = TUpdateBodySchema & {
  id: string;
};

export type TRemoveWorkScheduleResult =
  'removed' | 'not_found' | 'has_scheduled_shifts';
