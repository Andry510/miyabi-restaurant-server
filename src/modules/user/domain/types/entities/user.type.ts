export type TReferenceOutput = {
  id: string;
  name: string;
};

export type TUsersOutput = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string | null;
  status: boolean;
  work_area: TReferenceOutput | null;
  job_position: TReferenceOutput | null;
};

export type TUserOutput = TUsersOutput & {
  password_need_reset: boolean;
  created_at: Date;
  updated_at: Date;
};

export type TSessionOutput = {
  id: string;
  status: string;
  requester_ip: string | null;
  device: string | null;
  browser: string | null;
  last_access_at: Date | null;
  expire_at: Date | null;
  revoked_by: string | null;
  revoked_at: Date | null;
  created_at: Date;
};
