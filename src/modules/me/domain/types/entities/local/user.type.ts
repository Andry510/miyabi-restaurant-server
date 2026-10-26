//Domain
import type { TReference } from '@domain/types/shared';

export type TLocalUserOutput = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  status: boolean;
  work_area: TReference | null;
  job_position: TReference | null;
};
