//Domain
import type { TReference } from '@domain/types/shared';

export type TLinkedOutput = TReference & {
  description: string | null;
  status: boolean;
};

export type TLinkedUserOutput = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: boolean;
  work_area: TReference;
  job_position: TReference;
};
