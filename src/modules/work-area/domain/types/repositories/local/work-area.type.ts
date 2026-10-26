//Domain
import type { TRegisterSchema, TUpdateBodySchema } from '../../../schemas';

export type TCreateWorkAreaInput = TRegisterSchema;

export type TUpdateWorkAreaInput = TUpdateBodySchema & {
  id: string;
};

export type TRemoveWorkAreaResult = 'removed' | 'not_found' | 'has_employees';
