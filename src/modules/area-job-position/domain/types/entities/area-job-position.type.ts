export type TReferenceOutput = {
  id: string;
  name: string;
};

export type TLinkedOutput = TReferenceOutput & {
  description: string | null;
  status: boolean;
};

export type TLinkedUserOutput = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: boolean;
  work_area: TReferenceOutput;
  job_position: TReferenceOutput;
};
