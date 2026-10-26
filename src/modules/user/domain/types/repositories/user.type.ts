//Domain
import type { TRegisterSchema, TUpdateBodySchema } from '../../schemas';

export type TCreateUserInput = Omit<
  TRegisterSchema,
  'password' | 'work_area_id' | 'job_position_id'
> & {
  password_hash: string;
  area_job_position_id: string | null;
};

export type TUpdateUserInput = Omit<
  TUpdateBodySchema,
  'work_area_id' | 'job_position_id'
> & {
  id: string;
  area_job_position_id: string | null;
  revoke_sessions_by: string | null;
};

export type TUserConflicts = {
  email: boolean;
  phone_number: boolean;
};
