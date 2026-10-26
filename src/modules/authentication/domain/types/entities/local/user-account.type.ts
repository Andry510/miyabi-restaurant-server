export type TUserAccountProps = {
  user_id: string;
  email: string;
  password: string;
  password_need_reset: boolean;
  status: boolean;
  deleted_at: Date | null;
};
