//Domain
import type { TRegisterSchema, TUpdateBodySchema } from '../../../schemas';

export type TCreateJobPositionInput = TRegisterSchema;

export type TUpdateJobPositionInput = TUpdateBodySchema & {
  id: string;
};

export type TRemoveJobPositionResult =
  'removed' | 'not_found' | 'has_employees';
