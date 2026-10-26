//Domain
import type { TReference } from '../shared';

export type TUserAssignment = {
  id: string;
  work_area: TReference;
  job_position: TReference;
};

export type TUserDetail = {
  id: string;
  status: boolean;

  first_name: string;
  last_name: string;

  email: string;
  phone_number: string | null;

  assignment: TUserAssignment | null;
};

export type TKeyUserDetail = keyof TUserDetail;
